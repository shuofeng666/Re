// src/App.tsx - 完整版本
import React, { useState, useRef } from 'react';
import AdvancedBlocklyWorkspace from './components/AdvancedBlocklyWorkspace';
import ThreeJSViewer from './components/ThreeJSViewer';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import './App.css';

// 导入必要的处理类
import { MeshProjection } from './utils/geometryProcessing/MeshProjection';
import { Extrude } from './utils/geometryProcessing/Extrude';

// 模拟执行环境
const createExecutionEnvironment = (scene: THREE.Scene) => {
  return {
    // Three.js 全局对象
    THREE: THREE,
    STLLoader: STLLoader,
    
    // 场景相关
    currentScene: scene,
    
    // 工具类
    MeshProjection: MeshProjection,
    Extrude: Extrude,
    
    // 辅助函数
    createTextLabel: (text: string, position: THREE.Vector3, options: any = {}) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      const fontSize = options.fontSize || 16;
      const padding = options.padding || 5;
      
      context.font = `${fontSize}px Arial`;
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      
      canvas.width = textWidth + padding * 2;
      canvas.height = fontSize + padding * 2;
      
      context.fillStyle = options.backgroundColor || 'rgba(255, 255, 255, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = `${fontSize}px Arial`;
      context.fillStyle = options.textColor || '#000000';
      context.fillText(text, padding, fontSize + padding / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      
      sprite.position.copy(position);
      sprite.scale.set(
        canvas.width * (options.scaleFactor || 0.1), 
        canvas.height * (options.scaleFactor || 0.1), 
        1
      );
      
      return sprite;
    },
    
    // 模拟函数
    initializeThreeScene: (containerId: string) => {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      return {
        scene: scene,
        camera: scene.userData.camera,
        renderer: scene.userData.renderer,
        controls: scene.userData.controls,
        container: container
      };
    },
    
    loadSTLModel: async (path: string, options: any = {}) => {
      return new Promise((resolve, reject) => {
        const loader = new STLLoader();
        loader.load(
          path,
          (geometry) => {
            if (options.center) {
              geometry.computeBoundingBox();
              const box = geometry.boundingBox!;
              const center = box.getCenter(new THREE.Vector3());
              geometry.translate(-center.x, -center.y, -center.z);
            }
            
            if (options.rotateX) {
              geometry.rotateX(options.rotateX * Math.PI / 180);
            }
            
            const material = new THREE.MeshStandardMaterial({
              color: 0xdce3e7,
              roughness: 0.9,
              metalness: 0.0
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            resolve({ mesh, geometry });
          },
          undefined,
          reject
        );
      });
    },
    
    validateModelSize: (mesh: THREE.Mesh, bedSize: any) => {
      const bbox = new THREE.Box3().setFromObject(mesh);
      const size = bbox.getSize(new THREE.Vector3());
      
      const fits = {
        width: size.x <= bedSize.width,
        height: size.y <= bedSize.height,
        depth: size.z <= bedSize.depth
      };
      
      const isValid = fits.width && fits.height && fits.depth;
      
      return {
        isValid,
        dimensions: size,
        fits,
        message: isValid ? '模型尺寸符合要求' : '模型尺寸超出限制'
      };
    },
    
    // 全局变量存储
    window: {
      sceneData: null,
      modelData: null,
      projections: null
    }
  };
};

function App() {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(true);
  const [workflowType, setWorkflowType] = useState<'hotWire' | 'cnc' | 'laser' | 'custom'>('hotWire');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const addLog = (message: string) => {
    setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
  };

  const handleThreeJSReady = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // 保存到场景的 userData
    scene.userData.camera = camera;
    scene.userData.renderer = renderer;
    
    addLog('Three.js 场景已准备就绪');
  };

  const handleWorkflowRun = async () => {
    if (!generatedCode || !sceneRef.current) {
      addLog('错误: 没有生成的代码或场景未准备好');
      return;
    }

    setIsExecuting(true);
    setExecutionLog([]);
    addLog('开始执行工作流...');

    try {
      // 创建执行环境
      const env = createExecutionEnvironment(sceneRef.current);
      
      // 创建执行函数
      const AsyncFunction = (async function () {}).constructor as any;
      const executeCode = new AsyncFunction(
        ...Object.keys(env),
        generatedCode
      );
      
      // 执行代码
      const result = await executeCode(...Object.values(env));
      
      addLog('工作流执行完成');
      console.log('执行结果:', result);
    } catch (error) {
      console.error('执行错误:', error);
      addLog(`执行错误: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearScene = () => {
    if (!sceneRef.current) return;
    
    // 清除所有非必要的场景对象
    const objectsToRemove = sceneRef.current.children.filter(
      child => !child.isLight && child.type !== 'GridHelper' && child.type !== 'AxesHelper'
    );
    
    objectsToRemove.forEach(obj => {
      sceneRef.current!.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    });
    
    addLog('场景已清空');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>3D模型处理 - 可视化编程工作台</h1>
        <div className="workflow-selector">
          <label>工作流类型: </label>
          <select 
            value={workflowType} 
            onChange={(e) => setWorkflowType(e.target.value as any)}
          >
            <option value="hotWire">热线泡沫切割</option>
            <option value="cnc">CNC加工</option>
            <option value="laser">激光切割</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </header>
      
      <div className="main-container-integrated">
        <div className="left-panel">
          <AdvancedBlocklyWorkspace
            onCodeGenerated={handleCodeGenerated}
            onWorkflowRun={handleWorkflowRun}
            workflowType={workflowType}
          />
        </div>
        
        <div className="middle-panel">
          <div className="viewer-toolbar">
            <button onClick={clearScene} className="toolbar-button">
              清空场景
            </button>
            <button 
              onClick={handleWorkflowRun} 
              disabled={isExecuting}
              className="toolbar-button run-button"
            >
              {isExecuting ? '执行中...' : '执行代码'}
            </button>
          </div>
          <ThreeJSViewer onReady={handleThreeJSReady} />
          <div id="canvas-container" style={{ display: 'none' }}></div>
        </div>
        
        <div className="right-panel">
          <div className="panel-tabs">
            <button 
              className={`tab ${showCode ? 'active' : ''}`}
              onClick={() => setShowCode(true)}
            >
              生成的代码
            </button>
            <button 
              className={`tab ${!showCode ? 'active' : ''}`}
              onClick={() => setShowCode(false)}
            >
              执行日志
            </button>
          </div>
          
          {showCode ? (
            <pre className="code-display">
              {generatedCode || '// 拖拽模块生成代码'}
            </pre>
          ) : (
            <div className="log-display">
              {executionLog.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;