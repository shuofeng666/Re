// src/blockly/blocks/common3DBlocks.js
import * as Blockly from 'blockly';

// 通用3D处理块定义

// 1. 3D场景初始化块
Blockly.Blocks['scene3d_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("初始化3D场景");
    this.appendValueInput("CONTAINER_ID")
        .setCheck("String")
        .appendField("容器ID");
    this.appendDummyInput()
        .appendField("相机类型")
        .appendField(new Blockly.FieldDropdown([
          ["透视相机", "perspective"],
          ["正交相机", "orthographic"]
        ]), "CAMERA_TYPE");
    this.setOutput(true, "SceneData");
    this.setColour(160);
    this.setTooltip("创建Three.js场景、相机、渲染器和控制器");
  }
};

// 2. STL模型加载块
Blockly.Blocks['stl_loader_advanced'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("加载STL模型");
    this.appendValueInput("FILE_PATH")
        .setCheck("String")
        .appendField("文件路径");
    this.appendValueInput("MATERIAL")
        .setCheck("Material")
        .appendField("材质");
    this.appendDummyInput()
        .appendField("自动居中")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "CENTER");
    this.appendDummyInput()
        .appendField("旋转X轴")
        .appendField(new Blockly.FieldAngle(90), "ROTATE_X");
    this.setOutput(true, "MeshData");
    this.setColour(230);
    this.setTooltip("加载STL文件并创建3D网格");
  }
};

// 3. 材质创建块
Blockly.Blocks['material_creator_advanced'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("创建材质");
    this.appendDummyInput()
        .appendField("预设")
        .appendField(new Blockly.FieldDropdown([
          ["泡沫", "foam"],
          ["木材", "wood"],
          ["金属", "metal"],
          ["塑料", "plastic"],
          ["自定义", "custom"]
        ]), "PRESET");
    this.appendValueInput("COLOR")
        .setCheck("Colour")
        .appendField("颜色");
    this.appendValueInput("ROUGHNESS")
        .setCheck("Number")
        .appendField("粗糙度");
    this.appendValueInput("METALNESS")
        .setCheck("Number")
        .appendField("金属度");
    this.setOutput(true, "Material");
    this.setColour(180);
    this.setTooltip("创建Three.js材质");
  }
};

// 4. 尺寸验证块
Blockly.Blocks['dimension_validator'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("验证模型尺寸");
    this.appendValueInput("MESH")
        .setCheck("MeshData")
        .appendField("模型");
    this.appendValueInput("MAX_WIDTH")
        .setCheck("Number")
        .appendField("最大宽度(mm)");
    this.appendValueInput("MAX_HEIGHT")
        .setCheck("Number")
        .appendField("最大高度(mm)");
    this.appendValueInput("MAX_DEPTH")
        .setCheck("Number")
        .appendField("最大深度(mm)");
    this.setOutput(true, "ValidationResult");
    this.setColour(60);
    this.setTooltip("检查模型是否符合工作台尺寸");
  }
};

// 5. 可视化辅助工具块
Blockly.Blocks['visual_helpers'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("添加可视化辅助");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendValueInput("MESH")
        .setCheck("MeshData")
        .appendField("模型");
    this.appendDummyInput()
        .appendField("显示边界框")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "BOUNDING_BOX");
    this.appendDummyInput()
        .appendField("显示网格")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "GRID");
    this.appendDummyInput()
        .appendField("显示坐标轴")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "AXES");
    this.appendDummyInput()
        .appendField("显示标签")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "LABELS");
    this.setColour(200);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("添加各种可视化辅助工具");
  }
};

// 6. 模型变换块
Blockly.Blocks['mesh_transform'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("变换模型");
    this.appendValueInput("MESH")
        .setCheck("MeshData")
        .appendField("模型");
    this.appendValueInput("POSITION_X")
        .setCheck("Number")
        .appendField("位置 X");
    this.appendValueInput("POSITION_Y")
        .setCheck("Number")
        .appendField("位置 Y");
    this.appendValueInput("POSITION_Z")
        .setCheck("Number")
        .appendField("位置 Z");
    this.appendValueInput("ROTATION_X")
        .setCheck("Number")
        .appendField("旋转 X (度)");
    this.appendValueInput("ROTATION_Y")
        .setCheck("Number")
        .appendField("旋转 Y (度)");
    this.appendValueInput("ROTATION_Z")
        .setCheck("Number")
        .appendField("旋转 Z (度)");
    this.appendValueInput("SCALE")
        .setCheck("Number")
        .appendField("缩放");
    this.setOutput(true, "MeshData");
    this.setColour(290);
    this.setTooltip("变换模型的位置、旋转和缩放");
  }
};

// 7. 渲染循环块
Blockly.Blocks['render_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("启动渲染循环");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendStatementInput("UPDATE_LOGIC")
        .appendField("更新逻辑");
    this.setColour(320);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("启动3D场景的渲染循环");
  }
};

// 8. 场景添加模型块
Blockly.Blocks['scene_add_mesh'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("添加模型到场景");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendValueInput("MESH")
        .setCheck("MeshData")
        .appendField("模型");
    this.setColour(160);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("将模型添加到3D场景中");
  }
};

// 9. 光照设置块
Blockly.Blocks['lighting_setup'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("设置光照");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendDummyInput()
        .appendField("环境光强度")
        .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.1), "AMBIENT_INTENSITY");
    this.appendDummyInput()
        .appendField("方向光强度")
        .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.1), "DIRECTIONAL_INTENSITY");
    this.appendValueInput("DIRECTIONAL_POSITION")
        .setCheck("Vector3")
        .appendField("方向光位置");
    this.setColour(140);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("设置场景的光照");
  }
};

// 10. 导出块（通用）
Blockly.Blocks['export_file'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("导出文件");
    this.appendValueInput("DATA")
        .setCheck(["String", "SVGData", "JSONData"])
        .appendField("数据");
    this.appendValueInput("FILENAME")
        .setCheck("String")
        .appendField("文件名");
    this.appendDummyInput()
        .appendField("文件类型")
        .appendField(new Blockly.FieldDropdown([
          ["SVG", "svg"],
          ["JSON", "json"],
          ["文本", "txt"]
        ]), "FILE_TYPE");
    this.setColour(330);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("导出数据为文件");
  }
};