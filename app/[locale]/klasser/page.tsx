import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/index';

export default function ClassesPage() {
  const t = useTranslations('classes');

  const classTypes = [
    { id: 'hatha', level: 'beginner' },
    { id: 'vinyasa', level: 'intermediate' },
    { id: 'yin', level: 'all' },
    { id: 'ashtanga', level: 'advanced' },
    { id: 'prenatal', level: 'special' },
    { id: 'restorative', level: 'all' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-4">{t('title')}</h1>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          {t('description')}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classTypes.map((classType) => (
            <div key={classType.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t(`types.${classType.id}.name`)}</h3>
                <p className="text-sm text-purple-600 mb-3">{t(`levels.${classType.level}`)}</p>
                <p className="text-gray-600 mb-4">{t(`types.${classType.id}.description`)}</p>
                <Link 
                  href="/schema" 
                  className="text-purple-600 font-medium hover:text-purple-700"
                >
                  {t('viewSchedule')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}