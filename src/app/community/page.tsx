{/* ============================================================
  【社区页面】page.tsx — /community 路由入口文件
  ------------------------------------------------------------
  文件用途：Next.js App Router 的社区页面路由入口
  - 设置页面元数据（title、description）
  - 引入 CommunityClient 主组件
  - 这是用户访问 /community 时加载的第一个文件

  路由地址：/community
  最后更新：2026-06-15
  ============================================================ */}

import { Metadata } from 'next'
import CommunityClient from '@/components/community/CommunityClient'

export const metadata: Metadata = {
  title: 'Community Hub',
  description: 'Join the FUYOVIA community. Share feedback, suggest features, report bugs, and help shape our AI tools. Your voice matters.',
}

export default function CommunityPage() {
  return <CommunityClient />
}
