import React, { useState } from 'react';
import { useMultiLanguageStore, SUPPORTED_LANGUAGES } from '../stores/multiLanguageStore';
import { LanguageCode } from '../types/multiLanguage';
import { Plus, FolderOpen, Trash2, Edit3, Globe, Check, X } from 'lucide-react';

interface MultiLanguageProjectManagerProps {
  onProjectSelect?: () => void;
}

export const MultiLanguageProjectManager: React.FC<MultiLanguageProjectManagerProps> = ({
  onProjectSelect
}) => {
  const {
    projects,
    currentProject,
    createProject,
    loadProject,
    deleteProject,
    updateProjectName,
  } = useMultiLanguageStore();
  
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>(['zh-CN']);
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageCode>('zh-CN');
  const [editName, setEditName] = useState('');
  
  const handleCreateProject = () => {
    if (newProjectName.trim() && selectedLanguages.length > 0) {
      createProject({
        name: newProjectName.trim(),
        languages: selectedLanguages,
        defaultLanguage: defaultLanguage,
      });
      
      setNewProjectName('');
      setSelectedLanguages(['zh-CN']);
      setDefaultLanguage('zh-CN');
      setShowCreateProject(false);
      
      if (onProjectSelect) {
        onProjectSelect();
      }
    }
  };
  
  const handleLoadProject = (projectId: string) => {
    loadProject(projectId);
    if (onProjectSelect) {
      onProjectSelect();
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      deleteProject(projectId);
    }
  };
  
  const handleUpdateProjectName = (projectId: string) => {
    if (editName.trim()) {
      updateProjectName(projectId, editName.trim());
      setEditingProject(null);
      setEditName('');
    }
  };
  
  const handleLanguageToggle = (languageCode: LanguageCode) => {
    if (selectedLanguages.includes(languageCode)) {
      if (selectedLanguages.length > 1) {
        const newLanguages = selectedLanguages.filter(lang => lang !== languageCode);
        setSelectedLanguages(newLanguages);
        
        // 如果删除的是默认语言，设置第一个语言为默认
        if (defaultLanguage === languageCode) {
          setDefaultLanguage(newLanguages[0]);
        }
      }
    } else {
      setSelectedLanguages([...selectedLanguages, languageCode]);
    }
  };
  
  const startEditProject = (project: any) => {
    setEditingProject(project.id);
    setEditName(project.name);
  };
  
  const cancelEdit = () => {
    setEditingProject(null);
    setEditName('');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">多语言项目管理</h2>
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新建项目</span>
          </button>
        </div>
        
        {/* 项目列表 */}
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">还没有多语言项目</p>
              <p className="text-sm">创建您的第一个多语言项目来开始配置热区</p>
            </div>
          ) : (
            projects.map(project => {
              const isEditing = editingProject === project.id;
              const isCurrent = currentProject?.id === project.id;
              
              return (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="项目名称"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateProjectName(project.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                            {isCurrent && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                当前项目
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <span>{project.languages.length} 种语言</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {project.languages.slice(0, 3).map(langCode => {
                                const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
                                return langInfo ? (
                                  <span key={langCode} className="text-lg" title={langInfo.nativeName}>
                                    {langInfo.flag}
                                  </span>
                                ) : null;
                              })}
                              {project.languages.length > 3 && (
                                <span className="text-gray-400">+{project.languages.length - 3}</span>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              默认: {SUPPORTED_LANGUAGES.find(lang => lang.code === project.defaultLanguage)?.nativeName}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="flex items-center space-x-2">
                        {!isCurrent && (
                          <button
                            onClick={() => handleLoadProject(project.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FolderOpen className="w-4 h-4" />
                            <span>打开</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => startEditProject(project)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="重命名项目"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除项目"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* 创建项目弹窗 */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">创建多语言项目</h3>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择语言
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map(language => {
                    const isSelected = selectedLanguages.includes(language.code);
                    const isDefault = defaultLanguage === language.code;
                    
                    return (
                      <div key={language.code} className="flex items-center justify-between">
                        <button
                          onClick={() => handleLanguageToggle(language.code)}
                          className={`flex items-center space-x-2 flex-1 p-2 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200 text-blue-900'
                              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{language.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{language.nativeName}</div>
                            <div className="text-xs text-gray-500">{language.code}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                        
                        {isSelected && (
                          <button
                            onClick={() => setDefaultLanguage(language.code)}
                            className={`ml-2 p-1 rounded transition-colors ${
                              isDefault
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title={isDefault ? '默认语言' : '设为默认语言'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  已选择 {selectedLanguages.length} 种语言，默认语言：
                  {SUPPORTED_LANGUAGES.find(lang => lang.code === defaultLanguage)?.nativeName}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateProject(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || selectedLanguages.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};