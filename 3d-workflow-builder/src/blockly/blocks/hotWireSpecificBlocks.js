// src/blockly/blocks/hotWireSpecificBlocks.js
import * as Blockly from 'blockly';

// 热线泡沫切割特定块定义

// 1. 投影生成块
Blockly.Blocks['projection_generator_advanced'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("生成2D投影");
    this.appendValueInput("GEOMETRY")
        .setCheck(["MeshData", "Geometry"])
        .appendField("几何体");
    this.appendDummyInput()
        .appendField("投影平面")
        .appendField(new Blockly.FieldDropdown([
          ["XY平面（顶视图）", "xy"],
          ["YZ平面（侧视图）", "yz"],
          ["XZ平面（正视图）", "xz"],
          ["全部平面", "all"]
        ]), "PLANE");
    this.appendDummyInput()
        .appendField("凹度值")
        .appendField(new Blockly.FieldNumber(10, 0, 100, 1), "CONCAVITY");
    this.setOutput(true, "ProjectionData");
    this.setColour(120);
    this.setTooltip("从3D模型生成2D投影轮廓");
  }
};

// 2. 挤出形状块
Blockly.Blocks['extrude_shape_advanced'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("挤出2D形状");
    this.appendValueInput("POINTS")
        .setCheck(["Array", "ProjectionData"])
        .appendField("轮廓点");
    this.appendValueInput("DEPTH")
        .setCheck("Number")
        .appendField("深度(mm)");
    this.appendValueInput("MATERIAL")
        .setCheck("Material")
        .appendField("材质");
    this.appendDummyInput()
        .appendField("启用斜角")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "BEVEL_ENABLED");
    this.appendValueInput("BEVEL_SIZE")
        .setCheck("Number")
        .appendField("斜角大小")
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(true, "MeshData");
    this.setColour(290);
    this.setTooltip("从2D轮廓创建3D挤出形状");
  }
};

// 3. 切割路径可视化块
Blockly.Blocks['cutting_path_visualizer'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("显示切割路径");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendValueInput("MODEL")
        .setCheck("MeshData")
        .appendField("模型");
    this.appendDummyInput()
        .appendField("显示顶部切割路径")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "SHOW_TOP");
    this.appendDummyInput()
        .appendField("显示侧面切割路径")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "SHOW_SIDE");
    this.appendDummyInput()
        .appendField("显示正面切割路径")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "SHOW_FRONT");
    this.appendValueInput("LINE_COLOR")
        .setCheck("Colour")
        .appendField("路径颜色");
    this.setColour(110);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("可视化热线切割路径");
  }
};

// 4. 泡沫板设置块
Blockly.Blocks['foam_board_setup'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("设置泡沫板");
    this.appendValueInput("WIDTH")
        .setCheck("Number")
        .appendField("宽度(mm)");
    this.appendValueInput("HEIGHT")
        .setCheck("Number")
        .appendField("高度(mm)");
    this.appendValueInput("THICKNESS")
        .setCheck("Number")
        .appendField("厚度(mm)");
    this.appendDummyInput()
        .appendField("泡沫类型")
        .appendField(new Blockly.FieldDropdown([
          ["EPS泡沫", "eps"],
          ["XPS泡沫", "xps"],
          ["聚氨酯泡沫", "pu"]
        ]), "FOAM_TYPE");
    this.setOutput(true, "FoamBoardData");
    this.setColour(80);
    this.setTooltip("设置泡沫板参数");
  }
};

// 5. 切割顺序生成块
Blockly.Blocks['cutting_sequence_generator'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("生成切割顺序");
    this.appendValueInput("PROJECTIONS")
        .setCheck("ProjectionData")
        .appendField("投影数据");
    this.appendDummyInput()
        .appendField("切割策略")
        .appendField(new Blockly.FieldDropdown([
          ["由外向内", "outside_in"],
          ["由内向外", "inside_out"],
          ["最优路径", "optimal"]
        ]), "STRATEGY");
    this.setOutput(true, "CuttingSequence");
    this.setColour(260);
    this.setTooltip("生成热线切割的顺序");
  }
};

// 6. 模板排列块
Blockly.Blocks['template_arrangement'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("排列切割模板");
    this.appendValueInput("PROJECTIONS")
        .setCheck("ProjectionData")
        .appendField("投影数据");
    this.appendValueInput("BOARD_SIZE")
        .setCheck("FoamBoardData")
        .appendField("板材尺寸");
    this.appendDummyInput()
        .appendField("排列方式")
        .appendField(new Blockly.FieldDropdown([
          ["水平排列", "horizontal"],
          ["垂直排列", "vertical"],
          ["最优化排列", "optimal"]
        ]), "ARRANGEMENT");
    this.appendValueInput("SPACING")
        .setCheck("Number")
        .appendField("间距(mm)");
    self.setOutput(true, "TemplateArrangement");
    this.setColour(240);
    this.setTooltip("在板材上排列切割模板");
  }
};

// 7. 切割指令生成块
Blockly.Blocks['cutting_instructions'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("生成切割指令");
    this.appendValueInput("SEQUENCE")
        .setCheck("CuttingSequence")
        .appendField("切割顺序");
    this.appendValueInput("ARRANGEMENT")
        .setCheck("TemplateArrangement")
        .appendField("模板排列");
    this.appendDummyInput()
        .appendField("包含安全提示")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "INCLUDE_SAFETY");
    this.appendDummyInput()
        .appendField("语言")
        .appendField(new Blockly.FieldDropdown([
          ["中文", "zh"],
          ["英文", "en"]
        ]), "LANGUAGE");
    this.setOutput(true, "Instructions");
    this.setColour(20);
    this.setTooltip("生成详细的切割指令文档");
  }
};

// 8. 切割模拟块
Blockly.Blocks['cutting_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("模拟切割过程");
    this.appendValueInput("SCENE")
        .setCheck("SceneData")
        .appendField("场景");
    this.appendValueInput("MODEL")
        .setCheck("MeshData")
        .appendField("模型");
    this.appendValueInput("SEQUENCE")
        .setCheck("CuttingSequence")
        .appendField("切割顺序");
    this.appendValueInput("SPEED")
        .setCheck("Number")
        .appendField("模拟速度");
    this.appendDummyInput()
        .appendField("显示热线")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "SHOW_WIRE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
    this.setTooltip("动画模拟热线切割过程");
  }
};

// 9. 切割结果验证块
Blockly.Blocks['cutting_validation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("验证切割结果");
    this.appendValueInput("ORIGINAL_MODEL")
        .setCheck("MeshData")
        .appendField("原始模型");
    this.appendValueInput("CUT_PROJECTIONS")
        .setCheck("ProjectionData")
        .appendField("切割投影");
    this.appendValueInput("TOLERANCE")
        .setCheck("Number")
        .appendField("容差(mm)");
    this.setOutput(true, "ValidationResult");
    this.setColour(40);
    this.setTooltip("验证切割结果与原始模型的匹配度");
  }
};

// 10. 完整热线切割工作流块
Blockly.Blocks['hot_wire_workflow_complete'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("热线泡沫切割完整工作流");
    this.appendValueInput("STL_FILE")
        .setCheck("String")
        .appendField("STL文件");
    this.appendValueInput("FOAM_BOARD")
        .setCheck("FoamBoardData")
        .appendField("泡沫板");
    this.appendValueInput("CUTTING_BED_SIZE")
        .setCheck("Object")
        .appendField("切割床尺寸");
    this.appendDummyInput()
        .appendField("自动优化")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "AUTO_OPTIMIZE");
    this.appendDummyInput()
        .appendField("生成指令")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "GENERATE_INSTRUCTIONS");
    this.appendDummyInput()
        .appendField("导出SVG")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "EXPORT_SVG");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip("执行完整的热线泡沫切割工作流");
  }
};