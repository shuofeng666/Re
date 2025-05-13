// src/blockly/generators/common3DGenerators.js
import { javascriptGenerator } from 'blockly/javascript';

// 通用3D处理代码生成器

// 1. 3D场景初始化
javascriptGenerator.forBlock['scene3d_init'] = function(block) {
  const containerId = javascriptGenerator.valueToCode(block, 'CONTAINER_ID', 
    javascriptGenerator.ORDER_ATOMIC);
  const cameraType = block.getFieldValue('CAMERA_TYPE');
  
  const code = `
// 初始化3D场景
const sceneData = (() => {
  const container = document.getElementById(${containerId});
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // 创建相机
  const camera = ${cameraType === 'perspective' ? 
    `new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)` :
    `new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000)`
  };
  camera.position.set(50, 50, 100);
  
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  
  // 创建控制器
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  
  // 添加基础灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  
  scene.add(ambientLight);
  scene.add(directionalLight);
  
  return { scene, camera, renderer, controls, container };
})()`;
  
  return [code, javascriptGenerator.ORDER_NONE];
};

// 2. STL加载器
javascriptGenerator.forBlock['stl_loader_advanced'] = function(block) {
  const filePath = javascriptGenerator.valueToCode(block, 'FILE_PATH', 
    javascriptGenerator.ORDER_ATOMIC);
  const material = javascriptGenerator.valueToCode(block, 'MATERIAL', 
    javascriptGenerator.ORDER_ATOMIC);
  const center = block.getFieldValue('CENTER') === 'TRUE';
  const rotateX = block.getFieldValue('ROTATE_X');
  
  const code = `
// 加载STL模型
const meshData = await (async () => {
  const loader = new THREE.STLLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      ${filePath},
      (geometry) => {
        // 处理几何体
        ${center ? `
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, -center.y, -center.z);
        ` : ''}
        
        ${rotateX ? `geometry.rotateX(${rotateX} * Math.PI / 180);` : ''}
        
        // 创建网格
        const mesh = new THREE.Mesh(geometry, ${material || 'new THREE.MeshStandardMaterial()'});
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        resolve({ mesh, geometry });
      },
      undefined,
      reject
    );
  });
})()`;
  
  return [code, javascriptGenerator.ORDER_NONE];
};

// 3. 材质创建
javascriptGenerator.forBlock['material_creator_advanced'] = function(block) {
  const preset = block.getFieldValue('PRESET');
  const color = javascriptGenerator.valueToCode(block, 'COLOR', 
    javascriptGenerator.ORDER_ATOMIC);
  const roughness = javascriptGenerator.valueToCode(block, 'ROUGHNESS', 
    javascriptGenerator.ORDER_ATOMIC);
  const metalness = javascriptGenerator.valueToCode(block, 'METALNESS', 
    javascriptGenerator.ORDER_ATOMIC);
  
  const presets = {
    foam: { color: 0xdce3e7, roughness: 0.9, metalness: 0.0 },
    wood: { color: 0xd2a679, roughness: 0.6, metalness: 0.1 },
    metal: { color: 0xc0c0c0, roughness: 0.4, metalness: 0.8 },
    plastic: { color: 0xffffff, roughness: 0.5, metalness: 0.3 }
  };
  
  const code = `
// 创建材质
const material = (() => {
  ${preset !== 'custom' ? 
    `const props = ${JSON.stringify(presets[preset] || presets.foam)};` :
    'const props = {};'
  }
  
  ${color ? `props.color = new THREE.Color(${color});` : ''}
  ${roughness ? `props.roughness = ${roughness};` : ''}
  ${metalness ? `props.metalness = ${metalness};` : ''}
  
  return new THREE.MeshStandardMaterial(props);
})()`;
  
  return [code, javascriptGenerator.ORDER_NONE];
};

// 4. 尺寸验证
javascriptGenerator.forBlock['dimension_validator'] = function(block) {
  const mesh = javascriptGenerator.valueToCode(block, 'MESH', 
    javascriptGenerator.ORDER_ATOMIC);
  const maxWidth = javascriptGenerator.valueToCode(block, 'MAX_WIDTH', 
    javascriptGenerator.ORDER_ATOMIC);
  const maxHeight = javascriptGenerator.valueToCode(block, 'MAX_HEIGHT', 
    javascriptGenerator.ORDER_ATOMIC);
  const maxDepth = javascriptGenerator.valueToCode(block, 'MAX_DEPTH', 
    javascriptGenerator.ORDER_ATOMIC);
  
  const code = `
// 验证模型尺寸
const validationResult = (() => {
  const meshObject = ${mesh}.mesh;
  const bbox = new THREE.Box3().setFromObject(meshObject);
  const size = bbox.getSize(new THREE.Vector3());
  
  const fits = {
    width: size.x <= ${maxWidth},
    height: size.y <= ${maxHeight},
    depth: size.z <= ${maxDepth}
  };
  
  const isValid = fits.width && fits.height && fits.depth;
  
  return {
    isValid,
    dimensions: {
      width: size.x,
      height: size.y,
      depth: size.z
    },
    fits,
    message: isValid ? '模型尺寸符合要求' : '模型尺寸超出限制'
  };
})()`;
  
  return [code, javascriptGenerator.ORDER_NONE];
};

// 5. 可视化辅助工具
javascriptGenerator.forBlock['visual_helpers'] = function(block) {
  const scene = javascriptGenerator.valueToCode(block, 'SCENE', 
    javascriptGenerator.ORDER_ATOMIC);
  const mesh = javascriptGenerator.valueToCode(block, 'MESH', 
    javascriptGenerator.ORDER_ATOMIC);
  const showBoundingBox = block.getFieldValue('BOUNDING_BOX') === 'TRUE';
  const showGrid = block.getFieldValue('GRID') === 'TRUE';
  const showAxes = block.getFieldValue('AXES') === 'TRUE';
  const showLabels = block.getFieldValue('LABELS') === 'TRUE';
  
  const code = `
// 添加可视化辅助工具
(() => {
  const sceneObj = ${scene}.scene;
  const meshObj = ${mesh}.mesh;
  
  ${showBoundingBox ? `
  // 添加边界框
  const boxHelper = new THREE.BoxHelper(meshObj, 0xffff00);
  boxHelper.userData.isHelper = true;
  sceneObj.add(boxHelper);
  ` : ''}
  
  ${showGrid ? `
  // 添加网格
  const gridHelper = new THREE.GridHelper(200, 20);
  gridHelper.userData.isHelper = true;
  sceneObj.add(gridHelper);
  ` : ''}
  
  ${showAxes ? `
  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(100);
  axesHelper.userData.isHelper = true;
  sceneObj.add(axesHelper);
  ` : ''}
  
  ${showLabels ? `
  // 添加标签（需要实现createTextLabel函数）
  const bbox = new THREE.Box3().setFromObject(meshObj);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());
  
  // 尺寸标签
  const dimensionText = \`宽: \${size.x.toFixed(1)}mm\\n高: \${size.y.toFixed(1)}mm\\n深: \${size.z.toFixed(1)}mm\`;
  const label = createTextLabel(dimensionText, center.clone().add(new THREE.Vector3(0, size.y/2 + 10, 0)));
  label.userData.isHelper = true;
  sceneObj.add(label);
  ` : ''}
})();\n`;
  
  return code;
};

// 6. 模型变换
javascriptGenerator.forBlock['mesh_transform'] = function(block) {
  const mesh = javascriptGenerator.valueToCode(block, 'MESH', 
    javascriptGenerator.ORDER_ATOMIC);
  const posX = javascriptGenerator.valueToCode(block, 'POSITION_X', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const posY = javascriptGenerator.valueToCode(block, 'POSITION_Y', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const posZ = javascriptGenerator.valueToCode(block, 'POSITION_Z', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const rotX = javascriptGenerator.valueToCode(block, 'ROTATION_X', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const rotY = javascriptGenerator.valueToCode(block, 'ROTATION_Y', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const rotZ = javascriptGenerator.valueToCode(block, 'ROTATION_Z', 
    javascriptGenerator.ORDER_ATOMIC) || '0';
  const scale = javascriptGenerator.valueToCode(block, 'SCALE', 
    javascriptGenerator.ORDER_ATOMIC) || '1';
  
  const code = `
// 变换模型
const transformedMesh = (() => {
  const meshObj = ${mesh}.mesh.clone();
  
  // 设置位置
  meshObj.position.set(${posX}, ${posY}, ${posZ});
  
  // 设置旋转（度转弧度）
  meshObj.rotation.set(
    ${rotX} * Math.PI / 180,
    ${rotY} * Math.PI / 180,
    ${rotZ} * Math.PI / 180
  );
  
  // 设置缩放
  const scaleValue = ${scale};
  meshObj.scale.set(scaleValue, scaleValue, scaleValue);
  
  return { mesh: meshObj, geometry: meshObj.geometry };
})()`;
  
  return [code, javascriptGenerator.ORDER_NONE];
};

// 7. 渲染循环
javascriptGenerator.forBlock['render_loop'] = function(block) {
  const scene = javascriptGenerator.valueToCode(block, 'SCENE', 
    javascriptGenerator.ORDER_ATOMIC);
  const updateLogic = javascriptGenerator.statementToCode(block, 'UPDATE_LOGIC');
  
  const code = `
// 启动渲染循环
(() => {
  const sceneData = ${scene};
  const { scene, camera, renderer, controls } = sceneData;
  
  function animate() {
    requestAnimationFrame(animate);
    
    // 更新控制器
    controls.update();
    
    // 执行自定义更新逻辑
    ${updateLogic}
    
    // 渲染场景
    renderer.render(scene, camera);
  }
  
  animate();
})();\n`;
  
  return code;
};

// 8. 场景添加模型
javascriptGenerator.forBlock['scene_add_mesh'] = function(block) {
  const scene = javascriptGenerator.valueToCode(block, 'SCENE', 
    javascriptGenerator.ORDER_ATOMIC);
  const mesh = javascriptGenerator.valueToCode(block, 'MESH', 
    javascriptGenerator.ORDER_ATOMIC);
  
  const code = `
// 添加模型到场景
${scene}.scene.add(${mesh}.mesh);\n`;
  
  return code;
};

// 9. 光照设置
javascriptGenerator.forBlock['lighting_setup'] = function(block) {
  const scene = javascriptGenerator.valueToCode(block, 'SCENE', 
    javascriptGenerator.ORDER_ATOMIC);
  const ambientIntensity = block.getFieldValue('AMBIENT_INTENSITY');
  const directionalIntensity = block.getFieldValue('DIRECTIONAL_INTENSITY');
  const directionalPosition = javascriptGenerator.valueToCode(block, 'DIRECTIONAL_POSITION', 
    javascriptGenerator.ORDER_ATOMIC) || 'new THREE.Vector3(10, 10, 10)';
  
  const code = `
// 设置光照
(() => {
  const sceneObj = ${scene}.scene;
  
  // 清除现有灯光
  const lights = sceneObj.children.filter(child => child.isLight);
  lights.forEach(light => sceneObj.remove(light));
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, ${ambientIntensity});
  sceneObj.add(ambientLight);
  
  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, ${directionalIntensity});
  directionalLight.position.copy(${directionalPosition});
  directionalLight.castShadow = true;
  sceneObj.add(directionalLight);
})();\n`;
  
  return code;
};

// 10. 导出文件
javascriptGenerator.forBlock['export_file'] = function(block) {
  const data = javascriptGenerator.valueToCode(block, 'DATA', 
    javascriptGenerator.ORDER_ATOMIC);
  const filename = javascriptGenerator.valueToCode(block, 'FILENAME', 
    javascriptGenerator.ORDER_ATOMIC);
  const fileType = block.getFieldValue('FILE_TYPE');
  
  const code = `
// 导出文件
(() => {
  const exportData = ${data};
  const fileName = ${filename};
  let content;
  let mimeType;
  
  switch('${fileType}') {
    case 'svg':
      content = exportData;
      mimeType = 'image/svg+xml';
      break;
    case 'json':
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      break;
    case 'txt':
      content = exportData.toString();
      mimeType = 'text/plain';
      break;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName + '.${fileType}';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
})();\n`;
  
  return code;
};