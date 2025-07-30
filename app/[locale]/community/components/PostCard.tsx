'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, MessageSquare, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import CommentsSection from './CommentsSection'
import type { CommunityPost } from '@/lib/types/community'

interface PostCardProps {
  post: CommunityPost
  spaceId: number
  onUpdate: () => void
}

export default function PostCard({ post, spaceId, onUpdate }: PostCardProps) {
  const t = useTranslations('community')
  const { toast } = useToast()
  const [liked, setLiked] = useState(post.user_has_liked || false)
  const [likeCount, setLikeCount] = useState(post.like_count || 0)
  const [liking, setLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleLike = async () => {
    if (liking) return
    
    setLiking(true)
    try {
      await braincore.likeCommunityPost(spaceId, post.id)
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch (error) {
      console.error('Error liking post:', error)
      toast({
        title: t('error'),
        description: t('likeFailed'),
        variant: 'destructive'
      })
    } finally {
      setLiking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>
                {post.author?.display_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {post.author?.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {post.post_type !== 'standard' && (
            <Badge variant="secondary">{post.post_type}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {post.title && (
          <h4 className="font-semibold mb-2">{post.title}</h4>
        )}
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-4 mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className={liked ? 'text-primary' : ''}
          >
            {liking ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Trophy className="mr-1 h-3 w-3" />
            )}
            {likeCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            {post.comment_count || 0}
          </Button>
        </div>
        
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentsSection 
              spaceId={spaceId} 
              postId={post.id}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}