'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CreatePostDialogProps {
  spaceId: number
  onPostCreated: () => void
}

export default function CreatePostDialog({ spaceId, onPostCreated }: CreatePostDialogProps) {
  const t = useTranslations('community')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast({
        title: t('error'),
        description: t('contentRequired'),
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      await braincore.createCommunityPost(spaceId, {
        title: title.trim() || undefined,
        content: content.trim(),
        post_type: 'standard'
      })

      toast({
        title: t('success'),
        description: t('postPublished'),
      })

      // Reset form and close dialog
      setTitle('')
      setContent('')
      setOpen(false)
      onPostCreated()
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: t('error'),
        description: t('postFailed'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          {t('createPost')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('createPost')}</DialogTitle>
          <DialogDescription>
            {t('shareThoughts')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('titleOptional')}</Label>
            <Input
              id="title"
              placeholder={t('postTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">{t('content')}</Label>
            <Textarea
              id="content"
              placeholder={t('postContent')}
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('post')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}