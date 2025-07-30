'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { CommunityComment } from '@/lib/types/community'

interface CommentsSectionProps {
  spaceId: number
  postId: number
  onUpdate: () => void
}

export default function CommentsSection({ spaceId, postId, onUpdate }: CommentsSectionProps) {
  const t = useTranslations('community')
  const { toast } = useToast()
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    try {
      const data = await braincore.getPostComments(spaceId, postId)
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }, [spaceId, postId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await braincore.createComment(spaceId, postId, newComment.trim())
      setNewComment('')
      await loadComments()
      onUpdate() // Update parent to refresh comment count
      toast({
        title: t('success'),
        description: t('commentPosted'),
      })
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: t('error'),
        description: t('commentFailed'),
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Input
          placeholder={t('writeComment')}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t('noComments')}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.author?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {comment.author?.display_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <p className="text-xs font-medium">
                    {comment.author?.display_name}
                  </p>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}