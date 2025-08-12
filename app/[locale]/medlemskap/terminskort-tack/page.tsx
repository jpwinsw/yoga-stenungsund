import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'membership' })
  
  return {
    title: t('termSuccess.metaTitle'),
    description: t('termSuccess.metaDescription'),
  }
}

export default async function TermMembershipSuccessPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'membership' })
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--yoga-paper)] to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-light text-gray-900">
                {t('termSuccess.title')}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {t('termSuccess.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-[var(--yoga-sage)]/10 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--yoga-sage)]" />
                  {t('termSuccess.whatHappensNext')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--yoga-sage)] mt-1">•</span>
                    <span>{t('termSuccess.allSessionsBooked')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--yoga-sage)] mt-1">•</span>
                    <span>{t('termSuccess.emailConfirmation')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--yoga-sage)] mt-1">•</span>
                    <span>{t('termSuccess.manageBookings')}</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/mina-bokningar" className="flex-1">
                  <Button className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90">
                    {t('termSuccess.viewMyBookings')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/schema" className="flex-1">
                  <Button variant="outline" className="w-full">
                    {t('termSuccess.viewSchedule')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}