import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../../contexts/MobileContext';
import { mobileUtilities } from '../../lib/mobile-utils';

// Configuration sections
interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'range' | 'button';
  value?: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  action?: () => void;
}

// Mobile configuration manager component
export function MobileConfigManager() {
  const { config, actions, capabilities, isMobile } = useMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('display');
  const [hasChanges, setHasChanges] = useState(false);

  // Configuration sections
  const configSections: ConfigSection[] = [
    {
      id: 'display',
      title: 'Görünüm',
      description: 'Ekran ve görünüm ayarları',
      icon: '📱',
      settings: [
        {
          id: 'fontSize',
          label: 'Yazı Boyutu',
          description: 'Oyun içi yazı boyutunu ayarlayın',
          type: 'select',
          value: config.preferences.fontSize,
          options: [
            { label: 'Küçük', value: 'small' },
            { label: 'Orta', value: 'medium' },
            { label: 'Büyük', value: 'large' },
          ],
        },
        {
          id: 'highContrast',
          label: 'Yüksek Kontrast',
          description: 'Daha iyi görünürlük için yüksek kontrast modunu etkinleştirin',
          type: 'toggle',
          value: config.preferences.highContrast,
        },
        {
          id: 'reducedMotion',
          label: 'Azaltılmış Animasyon',
          description: 'Animasyonları azaltarak performansı artırın',
          type: 'toggle',
          value: config.preferences.reducedMotion,
        },
      ],
    },
    {
      id: 'input',
      title: 'Giriş',
      description: 'Dokunmatik ve klavye ayarları',
      icon: '⌨️',
      settings: [
        {
          id: 'keyboardType',
          label: 'Klavye Türü',
          description: 'Tercih edilen klavye türünü seçin',
          type: 'select',
          value: config.preferences.keyboardType,
          options: [
            { label: 'Sistem Klavyesi', value: 'native' },
            { label: 'Sanal Klavye', value: 'virtual' },
            { label: 'Hibrit', value: 'hybrid' },
          ],
        },
        {
          id: 'hapticEnabled',
          label: 'Dokunsal Geri Bildirim',
          description: 'Dokunmatik etkileşimlerde titreşim geri bildirimi',
          type: 'toggle',
          value: config.preferences.hapticEnabled && capabilities.hasHapticFeedback,
        },
        {
          id: 'testHaptic',
          label: 'Dokunsal Geri Bildirimi Test Et',
          description: 'Dokunsal geri bildirim özelliğini test edin',
          type: 'button',
          action: () => actions.enableHapticFeedback([10, 50, 10]),
        },
      ],
    },
    {
      id: 'orientation',
      title: 'Yönlendirme',
      description: 'Ekran yönlendirme ayarları',
      icon: '🔄',
      settings: [
        {
          id: 'autoRotate',
          label: 'Otomatik Döndürme',
          description: 'Cihaz döndürüldüğünde ekranı otomatik döndür',
          type: 'toggle',
          value: config.preferences.autoRotate,
        },
        {
          id: 'lockPortrait',
          label: 'Dikey Kilitle',
          description: 'Ekranı dikey konumda kilitle',
          type: 'button',
          action: () => actions.lockOrientation('portrait'),
        },
        {
          id: 'lockLandscape',
          label: 'Yatay Kilitle',
          description: 'Ekranı yatay konumda kilitle',
          type: 'button',
          action: () => actions.lockOrientation('landscape'),
        },
        {
          id: 'unlockOrientation',
          label: 'Yönlendirme Kilidini Aç',
          description: 'Ekran yönlendirme kilidini kaldır',
          type: 'button',
          action: () => actions.unlockOrientation(),
        },
      ],
    },
    {
      id: 'performance',
      title: 'Performans',
      description: 'Performans ve pil tasarrufu ayarları',
      icon: '⚡',
      settings: [
        {
          id: 'frameRate',
          label: 'Hedef FPS',
          description: 'Animasyonlar için hedef kare hızı',
          type: 'range',
          value: config.performance.frameRate,
          min: 30,
          max: 60,
          step: 15,
        },
        {
          id: 'batteryOptimization',
          label: 'Pil Optimizasyonu',
          description: 'Pil tasarrufu için performansı optimize et',
          type: 'toggle',
          value: config.performance.batteryImpact === 'low',
        },
        {
          id: 'refreshCapabilities',
          label: 'Yetenekleri Yenile',
          description: 'Cihaz yeteneklerini yeniden tespit et',
          type: 'button',
          action: () => actions.refreshCapabilities(),
        },
      ],
    },
  ];

  // Handle setting change
  const handleSettingChange = useCallback((sectionId: string, settingId: string, value: any) => {
    setHasChanges(true);

    // Update configuration based on setting
    switch (settingId) {
      case 'fontSize':
      case 'highContrast':
      case 'reducedMotion':
      case 'keyboardType':
      case 'hapticEnabled':
      case 'autoRotate':
        actions.updateConfig({
          preferences: {
            ...config.preferences,
            [settingId]: value,
          },
        });
        break;

      case 'frameRate':
        actions.updateConfig({
          performance: {
            ...config.performance,
            frameRate: value,
          },
        });
        break;

      case 'batteryOptimization':
        actions.updateConfig({
          performance: {
            ...config.performance,
            batteryImpact: value ? 'low' : 'medium',
          },
        });
        break;

      default:
        console.warn(`Unknown setting: ${settingId}`);
    }
  }, [config, actions]);

  // Apply changes to CSS and DOM
  useEffect(() => {
    if (hasChanges) {
      // Apply font size changes
      const fontSizeMap = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem',
      };
      mobileUtilities.css.setCustomProperty('--mobile-font-size', fontSizeMap[config.preferences.fontSize]);

      // Apply contrast changes
      if (config.preferences.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      // Apply motion preferences
      if (config.preferences.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }

      // Apply performance settings
      mobileUtilities.css.setCustomProperty('--target-fps', config.performance.frameRate.toString());

      setHasChanges(false);
    }
  }, [config, hasChanges]);

  // Render setting control
  const renderSettingControl = (setting: ConfigSetting, sectionId: string) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={setting.value}
                onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.checked)}
                className="sr-only"
              />
              <div className={`
                w-12 h-6 rounded-full transition-colors duration-200
                ${setting.value ? 'bg-blue-500' : 'bg-gray-600'}
              `}>
                <div className={`
                  w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200
                  ${setting.value ? 'translate-x-6' : 'translate-x-0.5'}
                  mt-0.5
                `} />
              </div>
            </div>
            <span className="text-sm text-gray-300">{setting.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={setting.value}
              onChange={(e) => handleSettingChange(sectionId, setting.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{setting.min}</span>
              <span className="font-medium text-white">{setting.value}</span>
              <span>{setting.max}</span>
            </div>
          </div>
        );

      case 'button':
        return (
          <button
            onClick={setting.action}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            {setting.label}
          </button>
        );

      default:
        return null;
    }
  };

  if (!isMobile) {
    return null; // Only show on mobile devices
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 text-white hover:bg-gray-700/90 transition-colors shadow-lg"
        aria-label="Mobil Ayarlar"
      >
        ⚙️
      </button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">Mobil Ayarlar</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex h-96">
                {/* Section Navigation */}
                <div className="w-24 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                  {configSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        w-full p-3 text-center border-b border-gray-700 transition-colors
                        ${activeSection === section.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="text-xl mb-1">{section.icon}</div>
                      <div className="text-xs">{section.title}</div>
                    </button>
                  ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto">
                  {configSections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-4 ${activeSection === section.id ? 'block' : 'hidden'}`}
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {section.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {section.settings.map((setting) => (
                          <div key={setting.id} className="space-y-2">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {setting.label}
                              </div>
                              <div className="text-xs text-gray-400">
                                {setting.description}
                              </div>
                            </div>
                            {renderSettingControl(setting, section.id)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="text-xs text-gray-400 text-center">
                  Cihaz: {capabilities.hasTouch ? 'Dokunmatik' : 'Masaüstü'} • 
                  Ekran: {config.screenSize.width}×{config.screenSize.height}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileConfigManager;