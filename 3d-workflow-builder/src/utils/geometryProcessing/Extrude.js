// utils/geometryProcessing/Extrude.js
import * as THREE from 'three';

/**
 * 处理几何形状挤出的模块
 */
export class Extrude {
  /**
   * 创建从2D点数组挤出的3D形状
   * @param {Array} points - 点数组 [[x1,y1], [x2,y2], ...]
   * @param {number} depth - 挤出深度
   * @param {object} options - 可选配置项
   * @param {boolean} options.bevelEnabled - 是否启用斜角
   * @param {number} options.bevelThickness - 斜角厚度
   * @param {number} options.bevelSize - 斜角大小
   * @param {number} options.bevelSegments - 斜角分段数
   * @param {THREE.Material} options.material - 自定义材质
   * @param {THREE.Vector3} options.position - 位置
   * @param {THREE.Euler} options.rotation - 旋转
   * @returns {THREE.Mesh} 挤出的3D网格对象
   */
  static createExtrudedShape(points, depth = 3, options = {}) {
    if (!points || points.length < 3) return null;
    
    // 创建2D形状
    const shape = new THREE.Shape();
    points.forEach((point, index) => {
      if (index === 0) {
        shape.moveTo(point[0], point[1]);
      } else {
        shape.lineTo(point[0], point[1]);
      }
    });
    shape.closePath();

    // 挤出设置
    const extrudeSettings = {
      depth: depth,
      bevelEnabled: options.bevelEnabled || false,
    };
    
    // 添加斜角设置（如果启用）
    if (options.bevelEnabled) {
      extrudeSettings.bevelThickness = options.bevelThickness || 0.2;
      extrudeSettings.bevelSize = options.bevelSize || 0.1;
      extrudeSettings.bevelSegments = options.bevelSegments || 3;
    }

    // 创建几何体
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // 在Z轴上居中
    extrudeGeometry.computeBoundingBox();
    const boundingBox = extrudeGeometry.boundingBox;
    const offsetZ = (boundingBox.max.z - boundingBox.min.z) / 2;
    extrudeGeometry.translate(0, 0, offsetZ);

    // 创建材质（使用默认木质纹理或自定义材质）
    const extrudeMaterial = options.material || new THREE.MeshStandardMaterial({
      color: options.color || 0xd2a679,
      metalness: options.metalness || 0.1,
      roughness: options.roughness || 0.6,
    });

    // 创建网格
    const extrudeMesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
    
    // 应用位置和旋转（如果提供）
    if (options.position) extrudeMesh.position.copy(options.position);
    if (options.rotation) extrudeMesh.rotation.copy(options.rotation);
    
    return extrudeMesh;
  }
  
  /**
   * 沿特定方向挤出2D形状
   * @param {Array} points - 2D点数组
   * @param {THREE.Vector3} direction - 挤出方向
   * @param {number} distance - 挤出距离
   * @param {object} options - 可选配置项
   * @returns {THREE.Mesh} 挤出的3D网格
   */
  static extrudeToDirection(points, direction, distance, options = {}) {
    if (!points || points.length < 3 || !direction) return null;
    
    // 标准化方向向量
    const normalizedDir = direction.clone().normalize();
    
    // 创建2D形状
    const shape = new THREE.Shape();
    points.forEach((point, index) => {
      if (index === 0) {
        shape.moveTo(point[0], point[1]);
      } else {
        shape.lineTo(point[0], point[1]);
      }
    });
    shape.closePath();

    // 挤出设置
    const extrudeSettings = {
      depth: distance,
      bevelEnabled: options.bevelEnabled || false,
      steps: options.steps || 1
    };
    
    // 添加斜角设置（如果启用）
    if (options.bevelEnabled) {
      extrudeSettings.bevelThickness = options.bevelThickness || 0.2;
      extrudeSettings.bevelSize = options.bevelSize || 0.1;
      extrudeSettings.bevelSegments = options.bevelSegments || 3;
    }
    
    // 创建几何体
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // 创建材质
    const extrudeMaterial = options.material || new THREE.MeshStandardMaterial({
      color: options.color || 0xd2a679,
      metalness: options.metalness || 0.1,
      roughness: options.roughness || 0.6,
    });
    
    // 创建网格
    const extrudeMesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
    
    // 旋转网格以匹配指定方向
    // 计算从z轴到目标方向的旋转
    const zAxis = new THREE.Vector3(0, 0, 1);
    extrudeMesh.quaternion.setFromUnitVectors(zAxis, normalizedDir);
    
    // 应用位置（如果提供）
    if (options.position) extrudeMesh.position.copy(options.position);
    
    return extrudeMesh;
  }
  
  /**
   * 连接两个轮廓创建过渡形状（Loft）
   * @param {Array} contour1 - 第一个轮廓的点数组
   * @param {Array} contour2 - 第二个轮廓的点数组
   * @param {number} distance - 轮廓间距离
   * @param {object} options - 可选配置项
   * @returns {THREE.Mesh} 连接的3D网格
   */
  static createLoft(contour1, contour2, distance, options = {}) {
    if (!contour1 || !contour2 || contour1.length < 3 || contour2.length < 3) return null;
    
    // 创建两个2D形状
    const shape1 = new THREE.Shape();
    contour1.forEach((point, index) => {
      if (index === 0) {
        shape1.moveTo(point[0], point[1]);
      } else {
        shape1.lineTo(point[0], point[1]);
      }
    });
    shape1.closePath();
    
    const shape2 = new THREE.Shape();
    contour2.forEach((point, index) => {
      if (index === 0) {
        shape2.moveTo(point[0], point[1]);
      } else {
        shape2.lineTo(point[0], point[1]);
      }
    });
    shape2.closePath();
    
    // 创建路径和几何体
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // 计算两个形状的顶点
    const segments = Math.max(contour1.length, contour2.length);
    const shape1Points = this.resampleShape(shape1, segments);
    const shape2Points = this.resampleShape(shape2, segments);
    
    // 添加顶点
    for (let i = 0; i < shape1Points.length; i++) {
      vertices.push(shape1Points[i].x, shape1Points[i].y, 0);
      uvs.push(i / (shape1Points.length - 1), 0);
    }
    
    for (let i = 0; i < shape2Points.length; i++) {
      vertices.push(shape2Points[i].x, shape2Points[i].y, distance);
      uvs.push(i / (shape2Points.length - 1), 1);
    }
    
    // 创建三角形索引
    const numPoints = shape1Points.length;
    for (let i = 0; i < numPoints - 1; i++) {
      // 第一个形状上的索引
      const a = i;
      const b = i + 1;
      // 第二个形状上对应的索引
      const c = i + numPoints;
      const d = i + 1 + numPoints;
      
      // 添加两个三角形形成一个四边形
      indices.push(a, b, c);
      indices.push(c, b, d);
    }
    
    // 闭合形状
    indices.push(numPoints - 1, 0, numPoints * 2 - 1);
    indices.push(numPoints * 2 - 1, 0, numPoints);
    
    // 设置几何体属性
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    
    // 创建材质
    const material = options.material || new THREE.MeshStandardMaterial({
      color: options.color || 0xd2a679,
      metalness: options.metalness || 0.1,
      roughness: options.roughness || 0.6,
      side: THREE.DoubleSide
    });
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, material);
    
    // 应用位置和旋转（如果提供）
    if (options.position) mesh.position.copy(options.position);
    if (options.rotation) mesh.rotation.copy(options.rotation);
    
    return mesh;
  }
  
  /**
   * 对形状进行重采样以获得指定数量的点
   * @param {THREE.Shape} shape - Three.js形状对象
   * @param {number} numPoints - 期望的点数量
   * @returns {Array} 重采样后的点数组
   * @private
   */
  static resampleShape(shape, numPoints) {
    const points = shape.getPoints(Math.max(numPoints * 2, 50));
    const totalLength = this.calculatePathLength(points);
    const segmentLength = totalLength / (numPoints - 1);
    
    const resultPoints = [points[0]];
    let currentDist = 0;
    let lastPoint = points[0];
    
    for (let i = 1; i < points.length; i++) {
      const dist = lastPoint.distanceTo(points[i]);
      
      if (currentDist + dist >= segmentLength) {
        // 计算插值点
        const remainingDist = segmentLength - currentDist;
        const t = remainingDist / dist;
        
        const interpolatedPoint = new THREE.Vector2()
          .copy(lastPoint)
          .lerp(points[i], t);
        
        resultPoints.push(interpolatedPoint);
        
        // 重置当前距离和最后一个点
        lastPoint = interpolatedPoint;
        i--; // 重新检查当前线段
        currentDist = 0;
        
        // 达到期望的点数后退出
        if (resultPoints.length >= numPoints) break;
      } else {
        currentDist += dist;
        lastPoint = points[i];
      }
    }
    
    // 确保添加最后一个点以闭合形状
    if (resultPoints.length < numPoints) {
      resultPoints.push(points[points.length - 1]);
    }
    
    return resultPoints;
  }
  
  /**
   * 计算路径的总长度
   * @param {Array} points - 点数组
   * @returns {number} 路径长度
   * @private
   */
  static calculatePathLength(points) {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += points[i].distanceTo(points[i - 1]);
    }
    return length;
  }
}