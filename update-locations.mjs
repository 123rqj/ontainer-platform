const SUPABASE_URL = 'https://zoocnigbnnhvmldpbylm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yc4qS178cNeFHUK4TjHr1Q_xM6knee0';

async function supabaseRequest(table, options = {}) {
  const { method = 'GET', body, params } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

async function updateContainers() {
  // 各地集装箱数量
  const inventory = [
    { location: '西安', quantity: 5 },
    { location: '成都', quantity: 22 },
    { location: '青岛', quantity: 1 },
    { location: '太仓', quantity: 6 },
    { location: '郑州', quantity: 2 },
    { location: '武汉', quantity: 5 },
    { location: '明斯克', quantity: 1 },
    { location: '莫斯科', quantity: 7 },
    { location: '巴库', quantity: 2 },
    { location: '阿拉木图', quantity: 1 },
  ];

  const totalQty = inventory.reduce((sum, item) => sum + item.quantity, 0);
  console.log(`Total containers to assign: ${totalQty}`);

  // 获取所有箱子，按顺序排
  const containers = await supabaseRequest('containers', {
    params: { select: 'id,container_no', limit: 200, order: 'container_no' }
  });

  if (!Array.isArray(containers) || containers.length === 0) {
    console.log('No containers found. Creating 110 containers first...');
    
    // 创建110个箱子
    const inserts = [];
    for (let i = 1; i <= 110; i++) {
      inserts.push({
        container_no: `YLGH-40HQ-${String(i).padStart(3, '0')}`,
        type: '40HQ',
        status: 'available',
        location: null
      });
    }
    
    const res = await supabaseRequest('containers', {
      method: 'POST',
      body: inserts
    });
    console.log('Insert result:', JSON.stringify(res).slice(0, 200));
    return;
  }

  console.log(`Found ${containers.length} containers in DB`);

  // 分配地点：按顺序从头开始分配
  let idx = 0;
  for (const item of inventory) {
    for (let i = 0; i < item.quantity; i++) {
      if (idx >= containers.length) {
        console.error(`Not enough containers! Need ${item.quantity} for ${item.location} but only ${containers.length - idx} left`);
        break;
      }
      const c = containers[idx];
      // 更新这个箱子的地点
      const updateRes = await supabaseRequest(`containers?id=eq.${c.id}`, {
        method: 'PATCH',
        body: { location: item.location }
      });
      console.log(`Updated ${c.container_no} -> ${item.location}`);
      idx++;
    }
  }

  console.log(`\nDone! Assigned ${idx} containers to locations`);
}

updateContainers().catch(console.error);