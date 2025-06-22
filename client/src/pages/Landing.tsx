import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { ShoppingCart, Zap, Globe, Shield } from 'lucide-react';

export default function Landing() {
  const { t } = useI18n();

  const features = [
    {
      icon: ShoppingCart,
      title: t('landing.features.pos.title'),
      description: t('landing.features.pos.description'),
    },
    {
      icon: Zap,
      title: t('landing.features.keyboard.title'),
      description: t('landing.features.keyboard.description'),
    },
    {
      icon: Globe,
      title: t('landing.features.multilingual.title'),
      description: t('landing.features.multilingual.description'),
    },
    {
      icon: Shield,
      title: t('landing.features.gst.title'),
      description: t('landing.features.gst.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            {t('landing.getStarted')}
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Business Types Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t('landing.businessTypes.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border-2 border-orange-200 rounded-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('businessMode.restaurant')}
              </h3>
              <p className="text-gray-600">
                {t('landing.businessTypes.restaurant')}
              </p>
            </div>
            
            <div className="text-center p-6 border-2 border-green-200 rounded-xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('businessMode.pharmacy')}
              </h3>
              <p className="text-gray-600">
                {t('landing.businessTypes.pharmacy')}
              </p>
            </div>
            
            <div className="text-center p-6 border-2 border-lime-200 rounded-xl">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('businessMode.agri')}
              </h3>
              <p className="text-gray-600">
                {t('landing.businessTypes.agri')}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('landing.cta.subtitle')}
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
          >
            {t('landing.cta.button')}
          </Button>
        </div>
      </div>
    </div>
  );
}
