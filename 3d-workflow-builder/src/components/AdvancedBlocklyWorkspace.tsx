// src/components/AdvancedBlocklyWorkspace.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import '../blockly/blocks/common3DBlocks';
import '../blockly/blocks/hotWireSpecificBlocks';
import '../blockly/generators/common3DGenerators';
import '../blockly/generators/hotWireSpecificGenerators';
import './BlocklyWorkspace.css';

interface AdvancedBlocklyWorkspaceProps {
  onCodeGenerated?: (code: string) => void;
  onWorkflowRun?: () => void;
  workflowType?: 'hotWire' | 'cnc' | 'laser' | 'custom';
}

const AdvancedBlocklyWorkspace: React.FC<AdvancedBlocklyWorkspaceProps> = ({ 
  onCodeGenerated, 
  onWorkflowRun,
  workflowType = 'hotWire'
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  // 通用工具箱配置
  const commonTools = [
    {
      kind: 'category',
      name: '3D场景',
      colour: '160',
      contents: [
        { kind: 'block', type: 'scene3d_init' },
        { kind: 'block', type: 'scene_add_mesh' },
        { kind: 'block', type: 'lighting_setup' },
        { kind: 'block', type: 'render_loop' }
      ]
    },
    {
      kind: 'category',
      name: '模型操作',
      colour: '230',
      contents: [
        { kind: 'block', type: 'stl_loader_advanced' },
        { kind: 'block', type: 'mesh_transform' },
        { kind: 'block', type: 'dimension_validator' }
      ]
    },
    {
      kind: 'category',
      name: '材质',
      colour: '180',
      contents: [
        { kind: 'block', type: 'material_creator_advanced' }
      ]
    },
    {
      kind: 'category',
      name: '可视化',
      colour: '200',
      contents: [
        { kind: 'block', type: 'visual_helpers' }
      ]
    },
    {
      kind: 'category',
      name: '文件操作',
      colour: '330',
      contents: [
        { kind: 'block', type: 'export_file' }
      ]
    }
  ];

  // 热线泡沫切割特定工具
  const hotWireTools = [
    {
      kind: 'category',
      name: '投影处理',
      colour: '120',
      contents: [
        { kind: 'block', type: 'projection_generator_advanced' },
        { kind: 'block', type: 'extrude_shape_advanced' }
      ]
    },
    {
      kind: 'category',
      name: '泡沫切割',
      colour: '80',
      contents: [
        { kind: 'block', type: 'foam_board_setup' },
        { kind: 'block', type: 'cutting_path_visualizer' },
        { kind: 'block', type: 'cutting_sequence_generator' }
      ]
    },
    {
      kind: 'category',
      name: '切割流程',
      colour: '260',
      contents: [
        { kind: 'block', type: 'template_arrangement' },
        { kind: 'block', type: 'cutting_instructions' },
        { kind: 'block', type: 'cutting_simulation' },
        { kind: 'block', type: 'cutting_validation' }
      ]
    },
    {
      kind: 'category',
      name: '完整工作流',
      colour: '0',
      contents: [
        { kind: 'block', type: 'hot_wire_workflow_complete' }
      ]
    }
  ];

  // 基础编程块
  const basicBlocks = [
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: '变量',
      custom: 'VARIABLE'
    },
    {
      kind: 'category',
      name: '逻辑',
      colour: '210',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' }
      ]
    },
    {
      kind: 'category',
      name: '循环',
      colour: '120',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_forEach' },
        { kind: 'block', type: 'controls_flow_statements' }
      ]
    },
    {
      kind: 'category',
      name: '数学',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_round' }
      ]
    },
    {
      kind: 'category',
      name: '文本',
      colour: '160',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join' }
      ]
    }
  ];

  // 根据工作流类型构建工具箱
  const buildToolbox = useCallback(() => {
    let tools = [...commonTools];
    
    switch (workflowType) {
      case 'hotWire':
        tools = [...tools, ...hotWireTools];
        break;
      // 未来可以添加其他工作流类型的工具
      case 'cnc':
      case 'laser':
      case 'custom':
        // 添加相应的工具
        break;
    }
    
    tools = [...tools, ...basicBlocks];
    
    return {
      kind: 'categoryToolbox',
      contents: tools
    };
  }, [workflowType]);

  // 生成代码
  const generateCode = useCallback(() => {
    if (!workspace.current) return;

    try {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      if (onCodeGenerated) {
        onCodeGenerated(code);
      }
    } catch (error) {
      console.error('代码生成错误:', error);
    }
  }, [onCodeGenerated]);

  // 初始化 Blockly 工作区
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const toolbox = buildToolbox();

    // 创建工作区
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      }
    });

    // 监听工作区变化
    workspace.current.addChangeListener((event) => {
      if (event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE) {
        generateCode();
      }
    });

    // 加载默认工作流
    loadDefaultWorkflow();

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, [workflowType, generateCode, buildToolbox]);

  // 加载默认工作流
  const loadDefaultWorkflow = () => {
    if (!workspace.current) return;

    const defaultXml = getDefaultWorkflowXml(workflowType);
    const xml = Blockly.utils.xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, workspace.current);
  };

  // 获取默认工作流 XML
  const getDefaultWorkflowXml = (type: string) => {
    switch (type) {
      case 'hotWire':
        return `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <block type="scene3d_init" x="20" y="20">
              <value name="CONTAINER_ID">
                <block type="text">
                  <field name="TEXT">canvas-container</field>
                </block>
              </value>
              <field name="CAMERA_TYPE">perspective</field>
            </block>
          </xml>
        `;
      default:
        return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
    }
  };

  // 保存工作流
  const saveWorkflow = () => {
    if (!workspace.current) return;

    const xml = Blockly.Xml.workspaceToDom(workspace.current);
    const xmlText = Blockly.Xml.domToText(xml);
    
    const blob = new Blob([xmlText], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowType}_workflow.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 加载工作流
  const loadWorkflow = (file: File) => {
    if (!workspace.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlText = e.target?.result as string;
        const xml = Blockly.utils.xml.textToDom(xmlText);
        workspace.current?.clear();
        Blockly.Xml.domToWorkspace(xml, workspace.current!);
      } catch (error) {
        console.error('加载工作流失败:', error);
        alert('加载工作流失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  // 清空工作区
  const clearWorkspace = () => {
    if (workspace.current) {
      workspace.current.clear();
    }
  };

  // 加载示例
  const loadExample = () => {
    if (!workspace.current) return;

    // 这里可以加载预定义的示例
    console.log('加载示例工作流');
  };

  // 运行工作流
  const runWorkflow = () => {
    generateCode();
    if (onWorkflowRun) {
      onWorkflowRun();
    }
  };

  return (
    <div className="blockly-workspace-container">
      <div className="workspace-toolbar">
        <button onClick={runWorkflow} className="toolbar-button run-button">
          运行工作流
        </button>
        <button onClick={generateCode} className="toolbar-button">
          生成代码
        </button>
        <button onClick={saveWorkflow} className="toolbar-button">
          保存工作流
        </button>
        <label className="toolbar-button">
          加载工作流
          <input
            type="file"
            accept=".xml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadWorkflow(file);
            }}
            style={{ display: 'none' }}
          />
        </label>
        <button onClick={clearWorkspace} className="toolbar-button">
          清空工作区
        </button>
        <button onClick={loadExample} className="toolbar-button">
          加载示例
        </button>
      </div>
      <div
        ref={blocklyDiv}
        id="blockly-div"
        className="blockly-div"
      />
    </div>
  );
};

export default AdvancedBlocklyWorkspace;