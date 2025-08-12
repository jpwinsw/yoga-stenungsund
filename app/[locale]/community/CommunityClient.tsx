'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Users } from 'lucide-react'
import CreatePostDialog from './components/CreatePostDialog'
import PostCard from './components/PostCard'
import type { CommunitySpace, CommunityPost } from '@/lib/types/community'
import type { CommunityProfile } from '@/lib/types/braincore'

export default function CommunityClient() {
  const router = useRouter()
  const t = useTranslations('community')
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState<CommunitySpace[]>([])
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [activeSpace, setActiveSpace] = useState<CommunitySpace | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])

  const loadCommunityData = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (!braincore.isAuthenticated()) {
        router.push('/min-profil?redirect=/community')
        return
      }

      // Load community spaces and profile
      const [spacesData, profileData] = await Promise.all([
        braincore.getCommunitySpaces(),
        braincore.getCommunityProfile()
      ])

      setSpaces(spacesData)
      setProfile(profileData)

      // Load posts from first space if available
      if (spacesData.length > 0) {
        setActiveSpace(spacesData[0])
        const postsData = await braincore.getCommunityPosts(spacesData[0].id)
        setPosts(postsData.posts || [])
      }
    } catch (error) {
      console.error('Error loading community data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadCommunityData()
  }, [loadCommunityData])

  const handleSpaceChange = async (space: CommunitySpace) => {
    setActiveSpace(space)
    try {
      const postsData = await braincore.getCommunityPosts(space.id)
      setPosts(postsData.posts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!braincore.isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--yoga-light-sage)] to-white pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* No spaces message */}
        {spaces.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('noSpaces')}
              </h3>
              <p className="text-gray-600">
                {t('noSpacesDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{profile?.display_name || 'Member'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('level', { level: profile?.current_level || 1 })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('points')}</span>
                      <span className="font-medium">{profile?.total_points || 0}</span>
                    </div>
                    {profile?.current_tier && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('tier')}</span>
                        <Badge variant="secondary">{profile.current_tier.name}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Spaces List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('yourSpaces')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {spaces.map((space) => (
                    <Button
                      key={space.id}
                      variant={activeSpace?.id === space.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleSpaceChange(space)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {space.name}
                      <Badge variant="outline" className="ml-auto">
                        {space.member_count}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeSpace ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{activeSpace.name}</CardTitle>
                    <CardDescription>{activeSpace.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="posts">
                      <TabsList>
                        <TabsTrigger value="posts">{t('posts')}</TabsTrigger>
                        <TabsTrigger value="members">{t('members')}</TabsTrigger>
                        <TabsTrigger value="about">{t('about')}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="posts" className="space-y-4">
                        {/* Create Post Button */}
                        <CreatePostDialog 
                          spaceId={activeSpace.id} 
                          onPostCreated={() => loadCommunityData()}
                        />

                        {/* Posts Feed */}
                        {posts.length > 0 ? (
                          posts.map((post) => (
                            <PostCard 
                              key={post.id}
                              post={post}
                              spaceId={activeSpace.id}
                              onUpdate={() => loadCommunityData()}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-gray-600">{t('noPosts')}</p>
                            <p className="text-sm text-gray-500">
                              {t('beFirst')}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="members">
                        <div className="text-center py-12">
                          <Users className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-600">
                            {t('memberCount', { count: activeSpace.member_count })}
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="about">
                        <div className="space-y-4">
                          {activeSpace.welcome_message && (
                            <div>
                              <h4 className="font-semibold mb-2">{t('welcome')}</h4>
                              <p className="text-sm text-gray-600">
                                {activeSpace.welcome_message}
                              </p>
                            </div>
                          )}
                          {activeSpace.rules && (
                            <div>
                              <h4 className="font-semibold mb-2">{t('rules')}</h4>
                              <p className="text-sm text-gray-600">
                                {activeSpace.rules}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">
                      {t('noSpaces')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}