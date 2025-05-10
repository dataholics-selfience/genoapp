import React, { useEffect, useMemo, useState } from 'react';
import { X, Star, Building2, Mail, MapPin, Briefcase, Calendar, Award, Target, CheckCircle, TrendingUp, Globe, Tag, Users } from 'lucide-react';

interface StartupInfo {
  name: string;
  description: string;
  rating: number;
  ratingExplanation: string;
  website: string;
  category: string;
  vertical: string;
  foundedYear: string;
  teamSize: string;
  businessModel: string;
  email: string;
  ipoStatus: string;
  city: string;
  country: string;
  state: string;
  reasonForChoice: string;
}

interface ProjectInfo {
  planning: {
    phase: string;
    duration: string;
    description: string;
  }[];
  expectedResults: string[];
  competitiveAdvantages: string[];
}

interface StartupCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  challengeTitle: string;
  timestamp: Date;
}

// Function to generate unique vibrant colors
const generateUniqueColor = (index: number): { from: string; to: string } => {
  const hue1 = (index * 137.5) % 360;
  const hue2 = (hue1 + 40) % 360;
  return {
    from: `from-[hsl(${hue1},85%,60%)]`,
    to: `to-[hsl(${hue2},85%,60%)]`
  };
};

const formatWebsiteUrl = (url: string): string => {
  return url.replace(/^https?:\/\//, '');
};

const StarRating: React.FC<{ rating: number; explanation: string }> = ({ rating, explanation }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-[url(#half)]'
                : 'text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-300">{rating.toFixed(1)}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{explanation}</p>
    </div>
  );
};

const StartupCard: React.FC<{ 
  startup: StartupInfo; 
  gradientColors: { from: string; to: string };
  onClick: () => void;
}> = ({ startup, gradientColors, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
  >
    <div className={`bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} p-4`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-white">{startup.name}</h3>
        <StarRating rating={startup.rating} explanation={startup.ratingExplanation} />
      </div>
    </div>

    <div className="p-6 space-y-4">
      <p className="text-gray-300 leading-relaxed">{startup.description}</p>
      
      <div className="grid grid-cols-2 gap-4">
        {startup.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <a href={`https://${formatWebsiteUrl(startup.website)}`} target="_blank" rel="noopener noreferrer" 
               className="text-sm text-blue-400 hover:underline">{formatWebsiteUrl(startup.website)}</a>
          </div>
        )}
        {startup.vertical && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{startup.vertical}</span>
          </div>
        )}
        {startup.category && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{startup.category}</span>
          </div>
        )}
        {startup.teamSize && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{startup.teamSize}</span>
          </div>
        )}
        {startup.foundedYear && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{startup.foundedYear}</span>
          </div>
        )}
        {startup.businessModel && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{startup.businessModel}</span>
          </div>
        )}
        {(startup.city || startup.state || startup.country) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">
              {[startup.city, startup.state, startup.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="bg-gray-700/50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-400 mb-2">Motivo da Escolha</h4>
        <p className="text-gray-300 leading-relaxed">{startup.reasonForChoice}</p>
      </div>
    </div>
  </button>
);

const StartupFullView: React.FC<{
  startup: StartupInfo;
  gradientColors: { from: string; to: string };
  onBack: () => void;
}> = ({ startup, gradientColors, onBack }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden">
    <div className={`bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
          >
            ← Voltar para lista
          </button>
          <h2 className="text-3xl font-bold text-white">{startup.name}</h2>
        </div>
        <StarRating rating={startup.rating} explanation={startup.ratingExplanation} />
      </div>
    </div>

    <div className="p-8 space-y-6">
      <div className="prose prose-invert max-w-none">
        <p className="text-xl text-gray-300">{startup.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {startup.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Website</h4>
              <a href={`https://${formatWebsiteUrl(startup.website)}`} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-400 hover:underline">{formatWebsiteUrl(startup.website)}</a>
            </div>
          </div>
        )}

        {startup.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Email</h4>
              <a href={`mailto:${startup.email}`} className="text-blue-400 hover:underline">
                {startup.email}
              </a>
            </div>
          </div>
        )}

        {startup.foundedYear && (
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Ano de Fundação</h4>
              <p className="text-white">{startup.foundedYear}</p>
            </div>
          </div>
        )}

        {startup.businessModel && (
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Modelo de Negócio</h4>
              <p className="text-white">{startup.businessModel}</p>
            </div>
          </div>
        )}

        {startup.category && (
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Categoria</h4>
              <p className="text-white">{startup.category}</p>
            </div>
          </div>
        )}

        {startup.vertical && (
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Vertical</h4>
              <p className="text-white">{startup.vertical}</p>
            </div>
          </div>
        )}

        {startup.teamSize && (
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Tamanho do Time</h4>
              <p className="text-white">{startup.teamSize}</p>
            </div>
          </div>
        )}

        {startup.ipoStatus && (
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Status IPO</h4>
              <p className="text-white">{startup.ipoStatus}</p>
            </div>
          </div>
        )}

        {(startup.city || startup.state || startup.country) && (
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-400">Localização</h4>
              <p className="text-white">
                {[startup.city, startup.state, startup.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-700/50 p-6 rounded-lg">
        <h4 className="text-xl font-semibold text-blue-400 mb-4">Motivo da Escolha</h4>
        <p className="text-lg text-gray-300 leading-relaxed">{startup.reasonForChoice}</p>
      </div>
    </div>
  </div>
);

const StartupCardsModal: React.FC<StartupCardsModalProps> = ({
  isOpen,
  onClose,
  content,
  challengeTitle,
  timestamp,
}) => {
  const [selectedStartup, setSelectedStartup] = useState<StartupInfo | null>(null);
  const { startups, projectInfo } = useMemo(() => {
    try {
      const match = content.match(/<startup cards>(.*?)<\/startup cards>/s);
      if (!match) return { startups: [], projectInfo: null };

      const data = JSON.parse(match[1]);
      return {
        startups: data.startups,
        projectInfo: {
          planning: data.projectPlanning,
          expectedResults: data.expectedResults,
          competitiveAdvantages: data.competitiveAdvantages
        }
      };
    } catch (error) {
      console.error('Error parsing startup cards data:', error);
      return { startups: [], projectInfo: null };
    }
  }, [content]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="relative w-full h-screen max-h-screen bg-gray-900 text-white overflow-hidden">
        <div className="sticky top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-10">
          <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white">{challengeTitle}</h2>
              <p className="text-sm text-gray-400">{timestamp.toLocaleString()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)] px-4">
          <div className="max-w-7xl mx-auto py-6 space-y-8">
            {selectedStartup ? (
              <StartupFullView
                startup={selectedStartup}
                gradientColors={generateUniqueColor(
                  startups.findIndex(s => s.name === selectedStartup.name)
                )}
                onBack={() => setSelectedStartup(null)}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {startups.map((startup, index) => (
                    <StartupCard
                      key={index}
                      startup={startup}
                      gradientColors={generateUniqueColor(index)}
                      onClick={() => setSelectedStartup(startup)}
                    />
                  ))}
                </div>

                {projectInfo && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Planejamento do Projeto</h3>
                      </div>
                      <div className="space-y-4">
                        {projectInfo.planning.map((phase, index) => (
                          <div key={index} className="pl-4 border-l-2 border-blue-400/30">
                            <h4 className="text-lg font-medium text-blue-400">{phase.phase}</h4>
                            <p className="text-sm text-gray-400 mt-1">Duração: {phase.duration}</p>
                            <p className="text-gray-300 mt-1">{phase.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-bold text-white">Resultados Previstos</h3>
                      </div>
                      <ul className="space-y-3">
                        {projectInfo.expectedResults.map((result, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-green-400 text-lg mt-1">•</span>
                            <span className="text-gray-300">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Vantagens Competitivas</h3>
                      </div>
                      <ul className="space-y-3">
                        {projectInfo.competitiveAdvantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-purple-400 text-lg mt-1">•</span>
                            <span className="text-gray-300">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupCardsModal;