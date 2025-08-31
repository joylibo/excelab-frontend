import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Github } from "lucide-react";
import { useLanguage, replaceWithReactComponents } from "@/contexts/LanguageContext";
import { API_BASE_URL, OTHER_API } from "@/lib/api";

export function AboutSection() {
  const { t, language } = useLanguage();
  const [heartClicked, setHeartClicked] = useState(false);
  const [totalClicks, setTotalClicks] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if heart was clicked in the last hour
    const lastClick = localStorage.getItem('heart_last_click');
    const now = new Date().getTime();
    if (lastClick && (now - parseInt(lastClick)) < 60 * 60 * 1000) {
      setHeartClicked(true);
    }

    // Fetch total heart clicks
    fetchHeartStats();
  }, []);

  const fetchHeartStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${OTHER_API.HEART_STATS}`);
      if (response.ok) {
        const data = await response.json();
        setTotalClicks(data.total_clicks);
      }
    } catch (error) {
      console.error('Failed to fetch heart stats:', error);
    }
  };

  const handleHeartClick = async () => {
    if (heartClicked || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${OTHER_API.HEART_CLICK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHeartClicked(true);
        setTotalClicks(data.total_clicks);
        localStorage.setItem('heart_last_click', new Date().getTime().toString());
      } else {
        alert(t.about.alertHeartFail);
      }
    } catch (error) {
      console.error('Heart click failed:', error);
      alert(t.about.alertNetworkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{t.about.title}</h2>
        <p className="text-muted-foreground mt-2">{t.about.description}</p>
      </div>

      {/* Simplified content for all languages */}
      <Card>
        <CardHeader>
          <CardTitle>Hi, there 👋</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {t.about.welcome}
          </p>
          
          <div>
            <strong>{t.about.dataSecurityTitle}</strong><br />
            <p className="text-sm text-muted-foreground">
              {t.about.dataSecurity}
              <a 
                href="https://github.com/joylibo/excelab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1 inline-flex items-center gap-1"
              >
                <Github size={14} />
                GitHub
              </a>
            </p>
          </div>

          <div>
            <strong>{t.about.freeServiceTitle}</strong><br />
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {replaceWithReactComponents(t.about.freeService, {
                heart: <Heart size={14} className="inline-block text-red-500" />
              })}
            </p>
          </div>

          <div>
            <strong>{t.about.contactIdeasTitle}</strong><br />
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {t.about.contactIdeas}
            </p>
          </div>

          {/* Heart icon section */}
          <div className="text-center mt-8">
            <div 
              className={`inline-flex items-center justify-center p-2 rounded-full cursor-pointer transition-all ${
                heartClicked ? 'text-red-500 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'
              }`}
              onClick={handleHeartClick}
              style={{ fontSize: '40px' }}
            >
              <Heart 
                size={40} 
                fill={heartClicked ? 'currentColor' : 'none'} 
                className={isLoading ? 'opacity-50' : ''}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {heartClicked ? (
                totalClicks !== null ? (
                  t.about.heartTogether.replace('{count}', (totalClicks - 1).toString())
                ) : (
                  t.about.thankYouSupport
                )
              ) : (
                t.about.clickToSupport
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8 pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          {t.about.footer}
        </p>
      </div>
    </div>
  );
}
