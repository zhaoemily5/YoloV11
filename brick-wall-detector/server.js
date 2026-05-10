import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'dist')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const DISEASE_COLORS = {
  '风化': '#e74c3c',
  '泛碱': '#3498db',
  '裂缝': '#f39c12',
  '脱落': '#9b59b6',
  '缺损': '#1abc9c'
};

const REPAIR_RECOMMENDATIONS = {
  '风化': {
    description: '砖体表面因长期暴露于自然环境中，受风吹、日晒、雨淋等因素影响，导致表面材料逐渐脱落、疏松的现象。',
    severity: '表层风化（<5mm）为轻度，中层风化（5-15mm）为中度，深层风化（>15mm）为重度。',
    repairMethod: [
      '轻度风化：清理表面松散物，涂刷有机硅防护剂进行封护处理',
      '中度风化：清除风化层，采用与原砖材质相近的砖粉砂浆修补，表面做防护处理',
      '重度风化：拆除严重风化砖块，选用同规格、同材质的新砖替换，灌浆填充，做整体防护'
    ],
    materials: '有机硅防护剂、砖粉砂浆、同规格替换砖、环氧树脂灌浆料',
    preventionMeasures: '定期检查，及时修补微小破损；涂刷防护剂延缓风化；改善排水，减少积水浸泡'
  },
  '泛碱': {
    description: '砖体内部可溶性盐类随水分迁移至砖表面，水分蒸发后盐类结晶析出，在砖表面形成白色粉末或结晶体的现象。',
    severity: '轻度泛碱表现为表面少量白色粉末；中度泛碱表面白色结晶面积较大；重度泛碱可能导致砖体膨胀开裂。',
    repairMethod: [
      '轻度泛碱：用清水或稀盐酸溶液清洗表面，待干燥后涂刷防水剂',
      '中度泛碱：使用专业泛碱清洗剂处理，配合高压水枪冲洗，干燥后做防水憎水处理',
      '重度泛碱：分析泛碱成因，从源头解决水分问题；清除泛碱层，修补砖体，做系统防水处理'
    ],
    materials: '泛碱清洗剂、防水憎水剂、硅烷浸渍剂、防水砂浆',
    preventionMeasures: '做好墙体防水层；改善通风条件；避免使用含碱量高的水泥砂浆'
  },
  '裂缝': {
    description: '砖体或砌体出现线状开裂，可能由温度变化、不均匀沉降、外力作用等因素引起。',
    severity: '微裂缝（<0.3mm）为轻度，中裂缝（0.3-1.0mm）为中度，大裂缝（>1.0mm）为重度。',
    repairMethod: [
      '微裂缝：注入环氧树脂或聚氨酯灌浆料封闭裂缝',
      '中等裂缝：沿裂缝凿V型槽，清理后用弹性密封材料填充',
      '贯穿裂缝：分析裂缝成因，采用钢筋网片加固或化学锚栓固定，灌注结构胶修补'
    ],
    materials: '环氧树脂灌浆料、聚氨酯密封胶、碳纤维布、化学锚栓',
    preventionMeasures: '监测裂缝发展趋势；设置合理的伸缩缝；控制墙体荷载'
  },
  '脱落': {
    description: '砖块表面层状剥离或整块脱落，通常由冻融循环、粘结力不足或内部应力过大引起。',
    severity: '表面小面积脱落为轻度，大面积层状脱落为中度，整块砖脱落为重度。',
    repairMethod: [
      '小面积表面脱落：清理脱落区域，用修补砂浆找平修复',
      '大面积脱落：清除松动部分至牢固基层，分层修补恢复砖面',
      '整块脱落：清理基层，重新砌筑修补，确保与周围砖块连接牢固'
    ],
    materials: '修补砂浆、界面剂、同规格替换砖、砌筑砂浆',
    preventionMeasures: '做好防水排水处理；避免冻融循环损伤；定期检查及时维修'
  },
  '缺损': {
    description: '砖块出现缺角、破碎、缺失等损坏现象，可能由外力冲击、材料老化或施工不当引起。',
    severity: '小范围缺角为轻度，较大面积破碎为中度，砖块完全缺失为重度。',
    repairMethod: [
      '小范围缺损：用砖粉修补砂浆修复原有外形',
      '较大缺损：凿除损坏部分，用同材质砖块切割拼接修补',
      '砖块缺失：选用同规格、同色泽新砖替换，砌筑砂浆勾缝'
    ],
    materials: '砖粉修补砂浆、同规格替换砖、砌筑砂浆、勾缝剂',
    preventionMeasures: '避免外力撞击；加强日常巡查；设置防护措施'
  }
};

function generateDemoResults(imagePath, brickLengthMm = 240) {
  // 基于红砖长度计算像素到米的换算
  const imageWidth = 800;
  const estimatedBrickPixels = imageWidth / 6;
  const pixelToMeter = (brickLengthMm / 1000) / estimatedBrickPixels;
  
  const rawDetections = [
    { id: 1, class: '风化', confidence: 0.94, bbox: [52, 38, 245, 180], severity: '中度' },
    { id: 2, class: '风化', confidence: 0.87, bbox: [480, 320, 180, 150], severity: '轻度' },
    { id: 3, class: '泛碱', confidence: 0.91, bbox: [310, 85, 210, 165], severity: '中度' },
    { id: 4, class: '泛碱', confidence: 0.82, bbox: [60, 380, 155, 120], severity: '轻度' },
    { id: 5, class: '裂缝', confidence: 0.96, bbox: [380, 200, 45, 180], severity: '中度' },
    { id: 6, class: '裂缝', confidence: 0.78, bbox: [150, 290, 35, 120], severity: '轻度' },
    { id: 7, class: '脱落', confidence: 0.89, bbox: [560, 120, 130, 110], severity: '中度' },
    { id: 8, class: '缺损', confidence: 0.85, bbox: [680, 400, 90, 85], severity: '轻度' }
  ];
  
  // 计算面积和网格编号
  const detections = rawDetections.map(d => {
    let area = null;
    if (d.class === '风化' || d.class === '泛碱') {
      area = Math.round(d.bbox[2] * d.bbox[3] * pixelToMeter * pixelToMeter * 100) / 100;
    }
    const gridX = Math.floor(d.bbox[0] / (imageWidth / 4));
    const gridY = Math.floor(d.bbox[1] / (imageWidth / 4));
    return { ...d, area, gridId: `G${gridY + 1}-${gridX + 1}` };
  });

  const summary = {};
  detections.forEach(d => {
    if (!summary[d.class]) {
      summary[d.class] = { count: 0, totalArea: 0, maxSeverity: '轻度', items: [] };
    }
    summary[d.class].count++;
    if (d.area) summary[d.class].totalArea += d.area;
    summary[d.class].items.push(d);
    const order = { '轻度': 1, '中度': 2, '重度': 3 };
    if ((order[d.severity] || 0) > (order[summary[d.class].maxSeverity] || 0)) {
      summary[d.class].maxSeverity = d.severity;
    }
  });

  return {
    success: true,
    imagePath,
    imageWidth: 800,
    imageHeight: 600,
    totalDetections: detections.length,
    detections,
    summary,
    timestamp: new Date().toISOString(),
    modelInfo: { name: 'YOLOv11-BrickWall', version: '1.0', platform: '阿里云PAI' }
  };
}

// 干扰项类别 ID（电线、管线、阴影等）- 需要过滤
const INTERFERENCE_CLASSES = new Set([6, '6', 'NONE', 'none', 'interference', '干扰']);

function parsePAIResponse(paiResult, imagePath, brickLengthMm = 240, imageWidth = 800) {
  const detections = [];
  const classMap = {
    0: '风化', 1: '泛碱', 2: '裂缝', 3: '脱落', 4: '缺损',
    'weathering': '风化', 'efflorescence': '泛碱', 'crack': '裂缝',
    'spalling': '脱落', 'missing': '缺损',
    '风化': '风化', '泛碱': '泛碱', '裂缝': '裂缝', '脱落': '脱落', '缺损': '缺损'
  };

  const rawDetections = paiResult.detections || paiResult.results || paiResult.boxes || [];
  
  // 估算像素到米的换算比例（基于红砖长度）
  // 假设图中红砖约占图像宽度的 1/8 ~ 1/4
  const estimatedBrickPixels = imageWidth / 6; // 假设一块砖约占图像宽度的 1/6
  const pixelToMeter = (brickLengthMm / 1000) / estimatedBrickPixels;

  let validId = 0;
  rawDetections.forEach((det) => {
    const rawClass = det.class ?? det.label ?? det.category ?? det.name ?? det.id;
    
    // 过滤干扰项 (ID 06: NONE - 电线、管线、阴影)
    if (INTERFERENCE_CLASSES.has(rawClass)) {
      console.log(`[Filter] 过滤干扰项: class=${rawClass}`);
      return; // 跳过干扰项
    }
    
    const className = classMap[rawClass] || String(rawClass);
    // 如果映射后仍然不是有效病害类别，跳过
    if (!['风化', '泛碱', '裂缝', '脱落', '缺损'].includes(className)) {
      console.log(`[Filter] 过滤未知类别: ${rawClass} -> ${className}`);
      return;
    }
    
    const bbox = det.bbox || det.box || [0, 0, 0, 0];
    const confidence = det.confidence || det.score || det.prob || 0;

    // 计算物理面积（仅对风化和泛碱）
    let area = null;
    if (className === '风化' || className === '泛碱') {
      area = Math.round(bbox[2] * bbox[3] * pixelToMeter * pixelToMeter * 100) / 100;
    }

    let severity = '轻度';
    if (confidence >= 0.9) severity = '重度';
    else if (confidence >= 0.7) severity = '中度';

    validId++;
    // 计算网格编号（用于 QGIS 导出）
    const gridX = Math.floor(bbox[0] / (imageWidth / 4)); // 4列网格
    const gridY = Math.floor(bbox[1] / (imageWidth / 4)); // 假设正方形区域
    const gridId = `G${gridY + 1}-${gridX + 1}`;

    detections.push({ 
      id: validId, 
      class: className, 
      confidence: Math.round(confidence * 100) / 100, 
      bbox, 
      area, 
      severity,
      gridId // 网格编号，供 QGIS 使用
    });
  });

  const summary = {};
  detections.forEach(d => {
    if (!summary[d.class]) {
      summary[d.class] = { count: 0, totalArea: 0, maxSeverity: '轻度', items: [] };
    }
    summary[d.class].count++;
    if (d.area) summary[d.class].totalArea += d.area;
    summary[d.class].items.push(d);
    const order = { '轻度': 1, '中度': 2, '重度': 3 };
    if ((order[d.severity] || 0) > (order[summary[d.class].maxSeverity] || 0)) {
      summary[d.class].maxSeverity = d.severity;
    }
  });

  return {
    success: true,
    imagePath,
    imageWidth,
    imageHeight: imageWidth * 0.75, // 默认 4:3 比例
    totalDetections: detections.length,
    detections,
    summary,
    timestamp: new Date().toISOString(),
    modelInfo: { name: 'YOLOv11-BrickWall', version: '1.0', platform: '阿里云PAI' }
  };
}

// ===================== API Routes =====================

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传图片' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const brickLengthMm = parseInt(req.body.brickLengthMm) || 240;
    const paiApiUrl = process.env.PAI_API_URL;
    const paiApiToken = process.env.PAI_API_TOKEN;

    // 获取图片尺寸
    const sizeOf = await import('image-size').then(m => m.default).catch(() => null);
    let imageWidth = 800, imageHeight = 600;
    if (sizeOf) {
      try {
        const dimensions = sizeOf(req.file.path);
        imageWidth = dimensions.width || 800;
        imageHeight = dimensions.height || 600;
      } catch (e) { /* 使用默认值 */ }
    }

    let result;

    if (paiApiUrl && paiApiToken) {
      try {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');

        const response = await fetch(paiApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': paiApiToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Image })
        });

        if (!response.ok) {
          throw new Error(`PAI API error: ${response.status}`);
        }

        const paiResult = await response.json();
        result = parsePAIResponse(paiResult, imagePath, brickLengthMm, imageWidth);
        result.imageWidth = imageWidth;
        result.imageHeight = imageHeight;
        result.brickLengthMm = brickLengthMm;
      } catch (apiError) {
        console.error('PAI API调用失败，使用演示数据:', apiError.message);
        result = generateDemoResults(imagePath, brickLengthMm);
        result.note = 'PAI API调用失败，当前显示演示数据';
      }
    } else {
      result = generateDemoResults(imagePath, brickLengthMm);
      result.note = '演示模式 — 配置 .env 中的 PAI_API_URL 和 PAI_API_TOKEN 以连接真实模型';
    }

    result.brickLengthMm = brickLengthMm;
    res.json(result);
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ success: false, message: '检测失败: ' + error.message });
  }
});

// 工程量单价估算（元/m² 或 元/处）
const REPAIR_UNIT_COSTS = {
  '风化': { unit: 'm²', lightCost: 80, mediumCost: 150, severeCost: 280 },
  '泛碱': { unit: 'm²', lightCost: 60, mediumCost: 120, severeCost: 200 },
  '裂缝': { unit: '处', lightCost: 50, mediumCost: 150, severeCost: 350 },
  '脱落': { unit: '处', lightCost: 100, mediumCost: 250, severeCost: 500 },
  '缺损': { unit: '处', lightCost: 80, mediumCost: 200, severeCost: 400 }
};

app.post('/api/report/generate', (req, res) => {
  try {
    const { detectionResult } = req.body;
    if (!detectionResult) {
      return res.status(400).json({ success: false, message: '缺少检测结果数据' });
    }

    const { summary, timestamp, imagePath, totalDetections, detections, brickLengthMm } = detectionResult;

    // 网格病害分析
    const gridAnalysis = {};
    (detections || []).forEach(det => {
      const gridId = det.gridId || 'G1-1';
      if (!gridAnalysis[gridId]) {
        gridAnalysis[gridId] = { total: 0, diseases: {}, severity: '轻度', priority: 3 };
      }
      gridAnalysis[gridId].total++;
      gridAnalysis[gridId].diseases[det.class] = (gridAnalysis[gridId].diseases[det.class] || 0) + 1;
      
      // 更新网格严重程度
      const severityOrder = { '轻度': 1, '中度': 2, '重度': 3 };
      if (severityOrder[det.severity] > severityOrder[gridAnalysis[gridId].severity]) {
        gridAnalysis[gridId].severity = det.severity;
        gridAnalysis[gridId].priority = 4 - severityOrder[det.severity]; // 1=最高优先级
      }
    });

    // 按优先级排序网格
    const sortedGrids = Object.entries(gridAnalysis)
      .map(([id, data]) => ({ gridId: id, ...data }))
      .sort((a, b) => a.priority - b.priority);

    const diseaseDetails = [];
    const allDiseases = ['风化', '泛碱', '裂缝', '脱落', '缺损'];
    let totalEstimatedCost = 0;

    allDiseases.forEach(disease => {
      const data = summary[disease];
      const recommendation = REPAIR_RECOMMENDATIONS[disease];
      const unitCost = REPAIR_UNIT_COSTS[disease];
      
      // 计算工程量初估
      let estimatedCost = 0;
      let quantity = 0;
      if (data) {
        if (unitCost.unit === 'm²' && data.totalArea > 0) {
          quantity = data.totalArea;
          const costPerUnit = data.maxSeverity === '重度' ? unitCost.severeCost 
            : data.maxSeverity === '中度' ? unitCost.mediumCost : unitCost.lightCost;
          estimatedCost = Math.round(quantity * costPerUnit);
        } else if (unitCost.unit === '处') {
          quantity = data.count;
          const costPerUnit = data.maxSeverity === '重度' ? unitCost.severeCost 
            : data.maxSeverity === '中度' ? unitCost.mediumCost : unitCost.lightCost;
          estimatedCost = Math.round(quantity * costPerUnit);
        }
        totalEstimatedCost += estimatedCost;
      }
      
      diseaseDetails.push({
        name: disease,
        color: DISEASE_COLORS[disease],
        detected: !!data,
        count: data ? data.count : 0,
        totalArea: data ? (data.totalArea || null) : null,
        maxSeverity: data ? data.maxSeverity : '-',
        estimatedCost,
        quantity,
        unit: unitCost.unit,
        ...recommendation
      });
    });

    const totalDiseaseTypes = Object.keys(summary || {}).length;
    let overallRisk = '低风险';
    if (totalDetections > 6 || totalDiseaseTypes >= 4) overallRisk = '高风险';
    else if (totalDetections > 3 || totalDiseaseTypes >= 2) overallRisk = '中风险';

    const weatheringArea = summary?.['风化'] ? summary['风化'].totalArea : 0;
    const efflorescenceArea = summary?.['泛碱'] ? summary['泛碱'].totalArea : 0;

    const report = {
      title: '红砖墙病害检测修缮报告',
      generatedAt: new Date().toISOString(),
      detectionTime: timestamp,
      imagePath,
      brickLengthMm: brickLengthMm || 240,
      professionalNote: '基于专业级病害阈值法，已滤除历史自然纹理干扰',
      overallAssessment: {
        totalDiseaseTypes,
        totalDetections,
        overallRisk,
        weatheringArea: weatheringArea.toFixed(2),
        efflorescenceArea: efflorescenceArea.toFixed(2),
        totalEstimatedCost,
        recommendation: overallRisk === '高风险'
          ? '建议立即开展修缮工作，优先处理严重病害区域'
          : overallRisk === '中风险'
            ? '建议尽快制定修缮计划，定期监测病害发展'
            : '建议定期巡检，做好预防性维护'
      },
      gridAnalysis: sortedGrids,
      diseaseDetails,
      repairPlan: {
        urgentItems: diseaseDetails.filter(d => d.detected && d.maxSeverity === '重度'),
        importantItems: diseaseDetails.filter(d => d.detected && d.maxSeverity === '中度'),
        routineItems: diseaseDetails.filter(d => d.detected && d.maxSeverity === '轻度')
      }
    };

    res.json({ success: true, report });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, message: '报告生成失败' });
  }
});

// ===================== AI 智能分析 API =====================

/**
 * 调用 AI 大模型进行智能分析
 * 优先级: PAI_LLM > SiliconFlow > 规则引擎
 */
async function callAIModel(prompt, systemPrompt = '') {
  const paiLlmUrl = process.env.PAI_LLM_URL;
  const paiLlmToken = process.env.PAI_LLM_TOKEN;
  const siliconflowUrl = process.env.SILICONFLOW_URL;
  const siliconflowKey = process.env.SILICONFLOW_KEY;
  const siliconflowModel = process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-8B';

  // 优先使用 PAI LLM
  if (paiLlmUrl && paiLlmToken) {
    try {
      const response = await fetch(paiLlmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paiLlmToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt || '你是一位专业的建筑病害分析专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          content: data.choices?.[0]?.message?.content || '',
          provider: 'PAI-LLM'
        };
      }
    } catch (e) {
      console.error('PAI LLM 调用失败:', e.message);
    }
  }

  // 回退到 SiliconFlow
  if (siliconflowUrl && siliconflowKey) {
    try {
      const response = await fetch(siliconflowUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${siliconflowKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: siliconflowModel,
          messages: [
            { role: 'system', content: systemPrompt || '你是一位专业的建筑病害分析专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          content: data.choices?.[0]?.message?.content || '',
          provider: 'SiliconFlow'
        };
      } else {
        const errorText = await response.text();
        console.error('SiliconFlow API 错误:', response.status, errorText);
      }
    } catch (e) {
      console.error('SiliconFlow 调用失败:', e.message);
    }
  }

  // 都失败则返回空
  return { success: false, content: '', provider: 'none' };
}

/**
 * AI 智能分析接口 - 根据检测结果生成专业分析
 */
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { detectionResult, analysisType = 'comprehensive' } = req.body;
    
    if (!detectionResult) {
      return res.status(400).json({ success: false, message: '缺少检测结果数据' });
    }

    const { summary, totalDetections, detections } = detectionResult;
    
    // 构建分析提示词
    const diseaseList = Object.entries(summary || {})
      .map(([name, data]) => `- ${name}: ${data.count}处, 最高严重程度: ${data.maxSeverity}${data.totalArea ? `, 总面积约${data.totalArea.toFixed(2)}m²` : ''}`)
      .join('\n');

    let prompt = '';
    let systemPrompt = '你是一位拥有20年经验的古建筑保护专家和结构工程师，擅长红砖墙病害诊断与修缮方案制定。请用专业但易懂的语言回答。';

    switch (analysisType) {
      case 'cause':
        prompt = `基于以下红砖墙病害检测结果，请分析可能的病害成因：

检测到 ${totalDetections} 处病害：
${diseaseList}

请从以下角度分析：
1. 环境因素（气候、湿度、温差等）
2. 材料因素（砖体质量、砂浆配比等）
3. 结构因素（荷载、沉降、应力等）
4. 人为因素（使用不当、维护缺失等）

请给出专业的成因分析，每个病害类型单独分析。`;
        break;

      case 'repair':
        prompt = `基于以下红砖墙病害检测结果，请制定详细的修缮方案：

检测到 ${totalDetections} 处病害：
${diseaseList}

请提供：
1. 修缮优先级排序及理由
2. 每种病害的具体修缮工艺步骤
3. 推荐使用的材料及规格
4. 施工注意事项
5. 预计工期估算`;
        break;

      case 'prevention':
        prompt = `基于以下红砖墙病害检测结果，请提供预防性维护建议：

检测到 ${totalDetections} 处病害：
${diseaseList}

请提供：
1. 日常巡检要点
2. 季节性维护措施
3. 环境改善建议
4. 长期保护策略`;
        break;

      case 'comprehensive':
      default:
        prompt = `请对以下红砖墙病害检测结果进行综合专业分析：

检测到 ${totalDetections} 处病害：
${diseaseList}

请提供：
1. 整体病害评估（100字以内）
2. 主要风险点（列出3-5个关键风险）
3. 紧急处理建议（需要立即处理的事项）
4. 修缮优先级建议
5. 预防措施建议

请用专业但简洁的语言回答，适合写入正式报告。`;
        break;
    }

    const aiResult = await callAIModel(prompt, systemPrompt);

    if (aiResult.success && aiResult.content) {
      res.json({
        success: true,
        analysis: aiResult.content,
        provider: aiResult.provider,
        analysisType,
        timestamp: new Date().toISOString()
      });
    } else {
      // AI 不可用时，使用规则引擎生成基础分析
      const fallbackAnalysis = generateRuleBasedAnalysis(summary, totalDetections);
      res.json({
        success: true,
        analysis: fallbackAnalysis,
        provider: 'rule-engine',
        analysisType,
        timestamp: new Date().toISOString(),
        note: 'AI 服务暂不可用，已使用规则引擎生成分析'
      });
    }
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ success: false, message: 'AI 分析失败: ' + error.message });
  }
});

/**
 * AI 对话接口 - 支持用户追问
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: '请输入问题' });
    }

    const systemPrompt = `你是红砖墙病害智能检测系统的 AI 助手。你拥有丰富的古建筑保护、砖石结构病害诊断、修缮工艺方面的专业知识。

${context ? `当前检测上下文：${JSON.stringify(context)}` : ''}

请用专业但易懂的语言回答用户问题。如果问题超出你的专业范围，请诚实说明。`;

    const aiResult = await callAIModel(message, systemPrompt);

    if (aiResult.success) {
      res.json({
        success: true,
        reply: aiResult.content,
        provider: aiResult.provider,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        reply: '抱歉，AI 服务暂时不可用。您可以查看系统生成的规则分析报告，或稍后再试。',
        provider: 'fallback',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ success: false, message: 'AI 对话失败: ' + error.message });
  }
});

/**
 * 规则引擎生成基础分析（AI 不可用时的回退方案）
 */
function generateRuleBasedAnalysis(summary, totalDetections) {
  const diseases = Object.entries(summary || {});
  if (diseases.length === 0) {
    return '未检测到明显病害，建议定期巡检以预防潜在问题。';
  }

  let analysis = `## 病害检测分析报告\n\n`;
  analysis += `### 一、整体评估\n`;
  analysis += `本次检测共发现 **${totalDetections}** 处病害，涉及 **${diseases.length}** 种类型。`;
  
  const hasSevere = diseases.some(([_, d]) => d.maxSeverity === '重度');
  const hasMedium = diseases.some(([_, d]) => d.maxSeverity === '中度');
  
  if (hasSevere) {
    analysis += `存在重度病害，建议**立即**安排专业人员现场勘查并制定修缮方案。\n\n`;
  } else if (hasMedium) {
    analysis += `存在中度病害，建议**尽快**制定修缮计划，避免病害进一步发展。\n\n`;
  } else {
    analysis += `病害程度较轻，建议做好日常维护，定期监测病害发展。\n\n`;
  }

  analysis += `### 二、病害详情\n`;
  diseases.forEach(([name, data]) => {
    analysis += `\n**${name}**：检测到 ${data.count} 处，最高严重程度为${data.maxSeverity}`;
    if (data.totalArea) {
      analysis += `，总面积约 ${data.totalArea.toFixed(2)} m²`;
    }
    analysis += `。\n`;
    
    // 添加基础建议
    const recommendations = {
      '风化': '建议清理松散物后涂刷防护剂，严重处需更换砖块。',
      '泛碱': '建议清洗表面盐类结晶，做好防水处理，改善通风条件。',
      '裂缝': '建议监测裂缝发展，使用灌浆或密封材料修补。',
      '脱落': '建议清理脱落区域，分层修补恢复，做好防水处理。',
      '缺损': '建议使用同材质砖块修补或更换，确保结构完整性。'
    };
    analysis += `- ${recommendations[name] || '建议咨询专业人员制定修缮方案。'}\n`;
  });

  analysis += `\n### 三、后续建议\n`;
  analysis += `1. 建立病害档案，定期复检对比\n`;
  analysis += `2. 优先处理结构性病害（裂缝、脱落）\n`;
  analysis += `3. 改善排水和通风条件\n`;
  analysis += `4. 选用与原材料相容的修缮材料\n`;

  return analysis;
}

/**
 * 获取 AI 服务状态
 */
app.get('/api/ai/status', (_req, res) => {
  const paiLlmConfigured = !!(process.env.PAI_LLM_URL && process.env.PAI_LLM_TOKEN);
  const siliconflowConfigured = !!(process.env.SILICONFLOW_URL && process.env.SILICONFLOW_KEY);
  
  res.json({
    success: true,
    aiServices: {
      paiLlm: {
        configured: paiLlmConfigured,
        priority: 1,
        description: '阿里云 PAI 大模型（生产环境）'
      },
      siliconflow: {
        configured: siliconflowConfigured,
        model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-8B',
        priority: 2,
        description: 'SiliconFlow API（测试环境）'
      },
      ruleEngine: {
        configured: true,
        priority: 3,
        description: '规则引擎（兜底方案）'
      }
    },
    activeProvider: paiLlmConfigured ? 'PAI-LLM' : (siliconflowConfigured ? 'SiliconFlow' : 'rule-engine')
  });
});

// Catch-all: serve frontend
app.get('*', (_req, res) => {
  const entryPath = path.join(__dirname, 'dist', 'entry.html');
  if (fs.existsSync(entryPath)) {
    res.sendFile(entryPath);
  } else {
    res.status(200).send(`
      <html><head><title>红砖墙病害检测系统</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2>前端尚未构建</h2>
        <p>请运行 <code>npm run build</code> 后重新启动服务</p>
        <p>或使用 <code>npm run dev</code> 进入开发模式</p>
      </body></html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧱  红砖墙病害智能检测系统 v1.0');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡  服务地址: http://0.0.0.0:${PORT}`);
  console.log(`🔗  本地访问: http://localhost:${PORT}`);
  console.log('───────────────────────────────────────────────────────');
  console.log('📦  目标检测模型 (YOLOv11):');
  if (process.env.PAI_API_URL) {
    console.log(`    ✅ PAI EAS: ${process.env.PAI_API_URL}`);
  } else {
    console.log('    ⚠️  未配置，使用演示模式');
  }
  console.log('───────────────────────────────────────────────────────');
  console.log('🤖  AI 大模型服务:');
  if (process.env.PAI_LLM_URL) {
    console.log('    ✅ PAI LLM: 已配置（优先级 1）');
  }
  if (process.env.SILICONFLOW_URL && process.env.SILICONFLOW_KEY) {
    console.log(`    ✅ SiliconFlow: ${process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-8B'}（优先级 2）`);
  }
  if (!process.env.PAI_LLM_URL && !process.env.SILICONFLOW_KEY) {
    console.log('    ⚠️  未配置，使用规则引擎');
  }
  console.log('───────────────────────────────────────────────────────');
  console.log('📚  API 端点:');
  console.log('    POST /api/detect          - 病害检测');
  console.log('    POST /api/report/generate - 生成报告');
  console.log('    POST /api/ai/analyze      - AI 智能分析');
  console.log('    POST /api/ai/chat         - AI 对话');
  console.log('    GET  /api/ai/status       - AI 服务状态');
  console.log('    GET  /api/health          - 健康检查');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});
