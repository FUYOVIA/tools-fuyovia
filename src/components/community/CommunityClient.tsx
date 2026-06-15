'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

// ===== Types =====
interface Discussion {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  author_avatar: string | null
  status: 'open' | 'under_review' | 'planned' | 'implemented' | 'closed'
  votes_count: number
  comments_count: number
  views_count: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  discussion_id: string
  content: string
  author_id: string
  author_name: string
  author_avatar: string | null
  created_at: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '🌐', color: '#64748b' },
  { id: 'feedback', label: 'Feedback & Ideas', icon: '💡', color: '#0ea5e9' },
  { id: 'bug_report', label: 'Bug Reports', icon: '🐛', color: '#ef4444' },
  { id: 'feature_request', label: 'Feature Requests', icon: '✨', color: '#8b5cf6' },
  { id: 'general', label: 'General Chat', icon: '💬', color: '#f97316' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#0ea5e9', bg: '#e0f2fe' },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: '#fff7ed' },
  planned: { label: 'Planned', color: '#8b5cf6', bg: '#f3e8ff' },
  implemented: { label: 'Implemented', color: '#10b981', bg: '#ecfdf5' },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' },
}

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Most Popular' },
]

export default function CommunityClient() {
  const { user, loading: authLoading, signInWithGoogle, signInWithFacebook, signOut, getToken } = useAuth()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('latest')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)

  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [showLoginModal, setShowLoginModal] = useState(false)

  const PAGE_SIZE = 10

  // Fetch discussions
  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        category,
        sort,
        limit: PAGE_SIZE.toString(),
        offset: (page * PAGE_SIZE).toString(),
      })
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/discussions?${params}`)
      const json = await res.json()
      if (json.success) {
        setDiscussions(json.data)
        setTotal(json.total || 0)
      } else {
        setError(json.error || 'Failed to load discussions')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [category, sort, searchQuery, page])

  useEffect(() => {
    fetchDiscussions()
  }, [fetchDiscussions])

  // Fetch user votes when logged in
  useEffect(() => {
    if (!user) return
    fetch(`/api/vote?user_id=${user.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUserVotes(new Set(json.data.map((v: any) => v.discussion_id)))
        }
      })
      .catch(() => {})
  }, [user])

  // Open discussion detail
  const openDiscussion = async (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setView('detail')
    setCommentText('')
    try {
      const res = await fetch(`/api/discussions/${discussion.id}`)
      const json = await res.json()
      if (json.success) {
        setComments(json.comments || [])
      }
    } catch {
      // Use cached comments_count
      setComments([])
    }
  }

  // Back to list
  const backToList = () => {
    setView('list')
    setSelectedDiscussion(null)
    setComments([])
  }

  // Vote
  const handleVote = async (discussionId: string) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    const token = await getToken()
    if (!token) return

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ discussion_id: discussionId, user_id: user.id }),
    })

    const json = await res.json()
    if (json.success) {
      if (json.voted) {
        setUserVotes(prev => new Set([...prev, discussionId]))
        setDiscussions(prev => prev.map(d =>
          d.id === discussionId ? { ...d, votes_count: d.votes_count + 1 } : d
        ))
        if (selectedDiscussion?.id === discussionId) {
          setSelectedDiscussion(p => p ? { ...p, votes_count: p.votes_count + 1 } : null)
        }
      } else {
        setUserVotes(prev => {
          const s = new Set(prev)
          s.delete(discussionId)
          return s
        })
        setDiscussions(prev => prev.map(d =>
          d.id === discussionId ? { ...d, votes_count: Math.max(0, d.votes_count - 1) } : d
        ))
        if (selectedDiscussion?.id === discussionId) {
          setSelectedDiscussion(p => p ? { ...p, votes_count: Math.max(0, p.votes_count - 1) } : null)
        }
      }
    }
  }

  // Create discussion
  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)
    const token = await getToken()
    if (!token) { setSubmitting(false); setShowLoginModal(true); return }

    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          author_id: user!.id,
          author_name: user!.user_metadata?.full_name || user?.email?.split('@')[0],
          author_avatar: user!.user_metadata?.avatar_url || user!.user_metadata?.picture || null,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setShowCreateModal(false)
        setNewTitle('')
        setNewContent('')
        setNewCategory('general')
        fetchDiscussions()
      } else {
        alert(json.error || 'Failed to create discussion')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return

    setCommenting(true)
    const token = await getToken()
    if (!token) { setCommenting(false); setShowLoginModal(true); return }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          discussion_id: selectedDiscussion.id,
          content: commentText.trim(),
          author_id: user!.id,
          author_name: user!.user_metadata?.full_name || user?.email?.split('@')[0],
          author_avatar: user!.user_metadata?.avatar_url || user!.user_metadata?.picture || null,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setComments(prev => [...prev, json.data])
        setCommentText('')
        setSelectedDiscussion(prev =>
          prev ? { ...prev, comments_count: prev.comments_count + 1 } : null
        )
      } else {
        alert(json.error || 'Failed to add comment')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setCommenting(false)
    }
  }

  // Time formatting
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ===== Render: List View =====
  if (view === 'list') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Community Hub
            </span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-4">
            Your voice shapes FUYOVIA AI Tools. Share ideas, report bugs, suggest features — we&apos;re listening.
          </p>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            Every suggestion matters. Popular requests get prioritized, and implemented features are tracked right here.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => user ? setShowCreateModal(true) : setShowLoginModal(true)}
            className="btn-primary py-3 px-6 rounded-2xl font-semibold text-base flex items-center gap-2"
          >
            <span className="text-lg">+</span> New Discussion
          </button>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field flex-1 sm:w-64 text-sm"
            />
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}
              className="px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm font-medium text-neutral-600 bg-white focus:border-primary-300 focus:outline-none cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => { setCategory(cat.id); setPage(0) }}
              style={{
                background: category === cat.id ? `${cat.color}12` : 'white',
                borderColor: category === cat.id ? cat.color : '#e5e7eb',
                color: category === cat.id ? cat.color : '#6b7280'
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap hover:shadow-md`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200/50 text-red-700 text-sm font-medium text-center">
            {error}
            <button onClick={fetchDiscussions} className="ml-2 underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {(loading || authLoading) && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-neutral-100 rounded-lg mb-3" />
                <div className="h-4 w-1/2 bg-neutral-50 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Discussion List */}
        {!loading && !authLoading && (
          <>
            {discussions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
                <span className="text-5xl block mb-4">📝</span>
                <h3 className="text-lg font-bold text-neutral-700 mb-2">No discussions yet</h3>
                <p className="text-neutral-500 text-sm mb-4">Be the first to start a conversation!</p>
                <button onClick={() => user ? setShowCreateModal(true) : setShowLoginModal(true)}
                  className="btn-primary py-2.5 px-6 rounded-2xl font-semibold text-sm">
                  Start First Discussion
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((discussion) => {
                  const statusInfo = STATUS_CONFIG[discussion.status] || STATUS_CONFIG.open
                  const cat = CATEGORIES.find(c => c.id === discussion.category) || CATEGORIES[4]
                  const hasVoted = userVotes.has(discussion.id)

                  return (
                    <div
                      key={discussion.id}
                      onClick={() => openDiscussion(discussion)}
                      className="group bg-white rounded-2xl border border-neutral-100 shadow-soft p-5 cursor-pointer hover:shadow-large hover:border-primary-200/50 transition-all duration-200"
                    >
                      <div className="flex gap-4">
                        {/* Vote button */}
                        <div className="flex-shrink-0 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVote(discussion.id) }}
                            disabled={!user}
                            className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl border-2 font-bold text-sm transition-all ${
                              hasVoted
                                ? 'border-primary-400 bg-primary-50 text-primary-600'
                                : 'border-neutral-200 text-neutral-400 hover:border-primary-300 hover:text-primary-500'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                            <span className="text-xs mt-0.5 leading-tight">{discussion.votes_count}</span>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1.5">
                            <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors line-clamp-1 text-[15px]">
                              {discussion.title}
                            </h3>
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: statusInfo.bg, color: statusInfo.color }}>
                              {statusInfo.label}
                            </span>
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: `${cat.color}15`, color: cat.color }}>
                              {cat.icon} {cat.label.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{discussion.content}</p>

                          {/* Footer meta */}
                          <div className="flex items-center gap-4 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                                {discussion.author_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              {discussion.author_name}
                            </span>
                            <span>{timeAgo(discussion.created_at)}</span>
                            <span className="flex items-center gap-1">
                              💬 {discussion.comments_count}
                            </span>
                            <span className="flex items-center gap-1">
                              👁️ {discussion.views_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-outline py-2 px-4 rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="py-2 px-4 text-sm text-neutral-500 font-medium self-center">
                  Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  className="btn-outline py-2 px-4 rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== Create Modal ===== */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="p-6 border-b border-neutral-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-800">Start a New Discussion</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What's on your mind?" maxLength={200}
                    className="input-field" />
                  <div className="text-right text-xs text-neutral-400 mt-1">{newTitle.length}/200</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Details</label>
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your idea, feedback, or issue in detail..."
                    rows={5} maxLength={2000} className="input-field resize-none" />
                  <div className="text-right text-xs text-neutral-400 mt-1">{newContent.length}/2000</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <button key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          newCategory === cat.id
                            ? 'border-current shadow-sm'
                            : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                        style={newCategory === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}10` } : {}}
                      >
                        {cat.icon} {cat.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="btn-outline py-2.5 px-6 rounded-2xl font-semibold">Cancel</button>
                <button onClick={handleCreateDiscussion} disabled={!newTitle.trim() || !newContent.trim() || submitting}
                  className="btn-primary py-2.5 px-8 rounded-2xl font-semibold disabled:opacity-50">
                  {submitting ? 'Posting...' : '🚀 Post Discussion'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Login Modal ===== */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-in">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Join Our Community</h2>
                <p className="text-neutral-500 text-sm mb-8 max-w-xs mx-auto">
                  Sign in to post discussions, vote on ideas, and help shape FUYOVIA tools.
                </p>

                <div className="space-y-3">
                  <button onClick={() => { signInWithGoogle(); setShowLoginModal(false) }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl border-2 border-neutral-200 bg-white font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>

                  <button onClick={() => { signInWithFacebook(); setShowLoginModal(false) }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl border-2 border-neutral-200 bg-white font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Continue with Facebook
                  </button>
                </div>

                <p className="mt-6 text-xs text-neutral-400">
                  By signing in, you agree to our community guidelines.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== Render: Detail View =====
  if (view === 'detail' && selectedDiscussion) {
    const statusInfo = STATUS_CONFIG[selectedDiscussion.status] || STATUS_CONFIG.open
    const cat = CATEGORIES.find(c => c.id === selectedDiscussion.category) || CATEGORIES[4]
    const hasVoted = userVotes.has(selectedDiscussion.id)

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Back button */}
        <button onClick={backToList} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-6 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Community
        </button>

        {/* Discussion Content */}
        <article className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${cat.color}15`, color: cat.color }}>
              {cat.icon} {cat.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4 leading-tight">
            {selectedDiscussion.title}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                {selectedDiscussion.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="font-semibold text-neutral-700">{selectedDiscussion.author_name}</span>
            </div>
            <span>{timeAgo(selectedDiscussion.created_at)}</span>
            <span>💬 {selectedDiscussion.comments_count}</span>
            <span>👁️ {selectedDiscussion.views_count || 0}</span>
          </div>

          <div className="prose prose-slate max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {selectedDiscussion.content}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-neutral-100">
            <button
              onClick={() => handleVote(selectedDiscussion.id)}
              disabled={!user}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                hasVoted
                  ? 'border-primary-400 bg-primary-50 text-primary-600'
                  : 'border-neutral-200 text-neutral-500 hover:border-primary-300 hover:text-primary-500'
              } disabled:opacity-50`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
              {hasVoted ? 'Upvoted' : 'Upvote'}
              <span className="ml-1 font-bold">{selectedDiscussion.votes_count}</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-6 sm:p-8">
          <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
            💬 Comments ({comments.length})
          </h2>

          {/* Comment Input */}
          {user ? (
            <div className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={1000}
                className="input-field resize-none text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-neutral-400">{commentText.length}/1000</span>
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || commenting}
                  className="btn-primary py-2 px-5 rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {commenting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-neutral-50 rounded-2xl text-center">
              <p className="text-sm text-neutral-500 mb-3">
                Sign in to join the conversation
              </p>
              <button onClick={() => setShowLoginModal(true)} className="btn-primary py-2 px-5 rounded-xl font-semibold text-sm">
                Sign In to Comment
              </button>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4 divide-y divide-neutral-50">
              {comments.map((comment) => (
                <div key={comment.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                      {comment.author_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-neutral-700">{comment.author_name}</span>
                        <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <span className="text-2xl block mb-2">💭</span>
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          )}
        </section>
      </div>
    )
  }

  return null
}
