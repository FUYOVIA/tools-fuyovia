# FUYOVIA AI Tools - Shoplazza Integration Guide

## 方式一：自定义页面嵌入（推荐）

在店匠后台 → 页面 → 新建自定义页面 → 切换到 HTML 编辑模式，粘贴以下代码：

```html
<!-- FUYOVIA AI Tools - 嵌入代码 -->
<div id="fuyovia-tools" style="width:100%; min-height:800px;">
  <iframe 
    src="https://tools.fuyovia.com" 
    style="width:100%; min-height:1200px; border:none; border-radius:16px;"
    title="FUYOVIA AI Tools"
    loading="lazy"
    allow="clipboard-write"
  ></iframe>
</div>
```

## 方式二：装修板块添加 HTML 代码

在店匠后台 → 装修 → 自定义 HTML 板块，粘贴以下代码：

```html
<div id="fuyovia-tools-widget" style="width:100%; padding:0;">
  <iframe 
    src="https://tools.fuyovia.com" 
    style="width:100%; height:1200px; border:none; overflow:hidden;"
    title="FUYOVIA AI Tools"
    loading="lazy"
    allow="clipboard-write"
  ></iframe>
</div>
<script>
  // 自动调整 iframe 高度
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'fuyovia-height') {
      var iframe = document.querySelector('#fuyovia-tools-widget iframe');
      if (iframe && e.data.height) {
        iframe.style.height = e.data.height + 'px';
      }
    }
  });
</script>
```

## 方式三：应用自定义代码（全站嵌入）

在店匠后台 → 应用 → 自定义代码 → 添加到 `</body>` 前：

```html
<!-- FUYOVIA Tools - 仅在工具页面显示 -->
<script>
  (function() {
    var toolPages = ['/tools', '/ai-tools', '/toolkit'];
    var currentPath = window.location.pathname;
    var shouldShow = toolPages.some(function(p) { return currentPath.indexOf(p) > -1; });
    
    if (shouldShow) {
      var container = document.getElementById('page-content') || document.querySelector('main') || document.body;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://tools.fuyovia.com';
      iframe.style.cssText = 'width:100%; min-height:1200px; border:none;';
      iframe.title = 'FUYOVIA AI Tools';
      iframe.loading = 'lazy';
      iframe.allow = 'clipboard-write';
      container.appendChild(iframe);
    }
  })();
</script>
```

## 方式四：导航栏添加入口

在店匠后台 → 导航 → 添加菜单项：
- 名称: "AI Tools" 或 "工具箱"
- 链接: `https://tools.fuyovia.com`
- 或链接到自定义页面（方式一创建的页面）

---

## Shoplazza Webhook 设置

1. 登录店匠后台 → 设置 → 通知 → Webhooks
2. 添加 Webhook:
   - URL: `https://tools.fuyovia.com/api/shoplazza/webhook`
   - 事件: "Order Payment" (订单支付)
3. 复制 Webhook 签名密钥
4. 在 Vercel 环境变量中添加:
   - `SHOPLAZZA_WEBHOOK_SECRET` = 你的签名密钥

## SKU 映射配置

在 `src/app/api/shoplazza/webhook/route.ts` 中修改 SKU_MAPPINGS 对象：

```typescript
const SKU_MAPPINGS: Record<string, { tools: string[]; credits: number; plan: string }> = {
  'your-product-sku': {
    tools: ['ai-humanizer', 'social-media-writer'],  // 解锁的工具
    credits: 100,                                      // 赠送的积分
    plan: 'starter',                                   // 升级的套餐
  },
}
```

---

## 环境变量清单（Vercel 部署后配置）

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API Key (sk-...) |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥 |
| `STRIPE_STARTER_PRICE_ID` | Starter 套餐的 Price ID |
| `STRIPE_PRO_PRICE_ID` | Pro 套餐的 Price ID |
| `SHOPLAZZA_WEBHOOK_SECRET` | 店匠 Webhook 签名密钥 |
| `NEXT_PUBLIC_APP_URL` | https://tools.fuyovia.com |
