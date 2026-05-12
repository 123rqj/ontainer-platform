const SUPABASE_URL = 'https://zoocnigbnnhvmldpbylm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yc4qS178cNeFHUK4TjHr1Q_xM6knee0';

async function supabaseFetch(table, options = {}) {
  const { method = 'GET', body, params } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
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

async function main() {
  // 查看现有数据
  const existing = await supabaseFetch('containers', { params: { limit: 5 } });
  console.log('Sample existing:', JSON.stringify(existing, null, 2));

  // 获取总箱数
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/containers?select=id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const countData = await countRes.headers.get('content-range');
  console.log('Count header:', countData);
}

main().catch(console.error);