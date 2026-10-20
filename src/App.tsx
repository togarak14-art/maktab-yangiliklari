import React, { useState, useEffect } from 'react';
import { School, NewsItem, AdminUser, UserProfile, AppNotification } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { EntryPortal } from './components/EntryPortal';
import { NewsFeed } from './components/NewsFeed';
import { SchoolInfoView } from './components/SchoolInfoView';
import { CreateSchoolModal } from './components/CreateSchoolModal';
import { JoinSchoolModal } from './components/JoinSchoolModal';
import { CreateNewsModal } from './components/CreateNewsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import {
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
  School as SchoolIcon,
  FileText,
  User,
  ShieldCheck,
  Home,
} from 'lucide-react';

export default function App() {
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // User and Admin state
  const [userProfile, setUserProfile] = useState<UserProfile>(api.getUserProfile());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // FIRST ENTRY SCREEN: By default, show the 2-section portal first!
  const [showPortal, setShowPortal] = useState(true);
  const [prefillJoinCode, setPrefillJoinCode] = useState('');

  // Navigation tab for school view
  const [activeTab, setActiveTab] = useState<'news' | 'school_info' | 'members'>('news');

  // Modals
  const [createSchoolOpen, setCreateSchoolOpen] = useState(false);
  const [joinSchoolOpen, setJoinSchoolOpen] = useState(false);
  const [createNewsOpen, setCreateNewsOpen] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState<NewsItem | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Media Viewer Lightbox
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    type: 'image' | 'video';
    images?: string[];
    index?: number;
    videoUrl?: string | null;
    title?: string;
  }>({
    isOpen: false,
    type: 'image',
  });

  // Initial Data Fetch
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoadingSchools(true);
    try {
      // 1. Check existing admin session
      const adminData = await api.getCurrentAdmin();
      if (adminData) {
        setAdminUser(adminData.admin);
      }

      // 2. Fetch schools
      const allSchools = await api.getSchools();
      setSchools(allSchools);

      const profile = api.getUserProfile();
      setUserProfile(profile);

      // Choose available school in background if needed
      let selected: School | null = null;
      if (adminData) {
        selected = allSchools.find((s) => s.id === adminData.school.id) || null;
      }
      if (!selected && profile.connectedSchoolIds.length > 0) {
        selected = allSchools.find((s) => profile.connectedSchoolIds.includes(s.id)) || null;
      }
      if (!selected && allSchools.length > 0) {
        selected = allSchools[0];
      }

      if (selected) {
        setCurrentSchool(selected);
        await loadSchoolNews(selected.id);
      }

      // 4. Load notifications
      await loadNotifications(profile.connectedSchoolIds);
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoadingSchools(false);
    }
  };

  const loadSchoolNews = async (schoolId: string) => {
    setLoadingNews(true);
    try {
      const res = await api.getSchoolNews(schoolId);
      setNews(res.news);
      setCurrentSchool(res.school);
    } catch (err) {
      console.error('Error fetching school news:', err);
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadNotifications = async (schoolIds: string[]) => {
    try {
      const notifs = await api.getNotifications(schoolIds);
      setNotifications(notifs);
      setUnreadNotifs(notifs.length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const handleSelectSchool = async (school: School) => {
    setCurrentSchool(school);
    setShowPortal(false);
    setActiveTab('news');
    await loadSchoolNews(school.id);
  };

  // Connected schools filtered from list
  const connectedSchools = schools.filter((s) =>
    userProfile.connectedSchoolIds.includes(s.id) || (adminUser && adminUser.schoolId === s.id)
  );

  // Callbacks
  const handleSchoolCreated = async (newSchool: School, admin: AdminUser) => {
    setSchools((prev) => [newSchool, ...prev]);
    setCurrentSchool(newSchool);
    setAdminUser(admin);

    // Auto connect in user profile
    const updatedProfile: UserProfile = {
      ...userProfile,
      connectedSchoolIds: Array.from(new Set([...userProfile.connectedSchoolIds, newSchool.id])),
    };
    setUserProfile(updatedProfile);
    api.saveUserProfile(updatedProfile);

    // CRITICAL: Strictly empty news for newly created school!
    setNews([]);
    setShowPortal(false);
    setActiveTab('news');
  };

  const handleSchoolJoined = async (joinedSchool: School, updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setCurrentSchool(joinedSchool);
    setShowPortal(false);
    setActiveTab('news');
    await loadSchoolNews(joinedSchool.id);
    await loadNotifications(updatedProfile.connectedSchoolIds);
  };

  const handleNewsSaved = (savedItem: NewsItem, isEdit: boolean) => {
    if (isEdit) {
      setNews((prev) => prev.map((item) => (item.id === savedItem.id ? savedItem : item)));
    } else {
      setNews((prev) => [savedItem, ...prev]);
      if (currentSchool) {
        setCurrentSchool({
          ...currentSchool,
          newsCount: (currentSchool.newsCount || 0) + 1,
        });
      }
    }
    setEditingNewsItem(null);
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!currentSchool) return;
    try {
      await api.deleteNews(currentSchool.id, newsId);
      setNews((prev) => prev.filter((item) => item.id !== newsId));
      setCurrentSchool({
        ...currentSchool,
        newsCount: Math.max(0, (currentSchool.newsCount || 1) - 1),
      });
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const handleAdminLogout = async () => {
    await api.logoutAdmin();
    setAdminUser(null);
  };

  const handleDisconnectSchool = (schoolId: string) => {
    const updated = userProfile.connectedSchoolIds.filter((id) => id !== schoolId);
    const updatedProfile = { ...userProfile, connectedSchoolIds: updated };
    setUserProfile(updatedProfile);
    api.saveUserProfile(updatedProfile);

    if (currentSchool?.id === schoolId) {
      const remaining = schools.filter((s) => updated.includes(s.id));
      if (remaining.length > 0) {
        handleSelectSchool(remaining[0]);
      } else {
        setCurrentSchool(null);
        setShowPortal(true);
      }
    }
  };

  const isCurrentAdmin = Boolean(
    adminUser && currentSchool && adminUser.schoolId === currentSchool.id
  );

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans pb-24 sm:pb-8">
      {/* Top Header */}
      <Header
        currentSchool={currentSchool}
        connectedSchools={connectedSchools}
        allSchools={schools}
        onSelectSchool={handleSelectSchool}
        onOpenCreateSchool={() => setCreateSchoolOpen(true)}
        onOpenJoinSchool={() => {
          setPrefillJoinCode('');
          setJoinSchoolOpen(true);
        }}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenNotifications={() => {
          setNotificationsOpen(true);
          setUnreadNotifs(0);
        }}
        onOpenPortal={() => setShowPortal(true)}
        isPortalActive={showPortal}
        adminUser={adminUser}
        userProfile={userProfile}
        unreadCount={unreadNotifs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setShowPortal(false);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loadingSchools ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">Maktablar ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : showPortal || !currentSchool ? (
          /* FIRST ENTRY SCREEN (Kirish Ekrani: 1. Maktab yaratish, 2. Qo'shilish) */
          <EntryPortal
            onOpenCreateSchool={() => setCreateSchoolOpen(true)}
            onOpenJoinSchool={(prefill) => {
              setPrefillJoinCode(prefill || '');
              setJoinSchoolOpen(true);
            }}
            onSelectSchool={handleSelectSchool}
            onOpenAdminLogin={() => setAdminLoginOpen(true)}
            connectedSchools={connectedSchools}
            availableSchools={schools}
            adminUser={adminUser}
          />
        ) : (
          /* School News and Info View */
          <div className="space-y-6">
            {/* Quick Hero Banner / Switcher Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-base sm:text-lg">
                  {currentSchool.number || <SchoolIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                      {currentSchool.name}
                    </h2>
                    {isCurrentAdmin && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="truncate">{currentSchool.region}</span>
                    <span className="hidden min-[400px]:inline">·</span>
                    <span className="text-blue-700 font-medium">Ulanish kodi: <span className="font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{currentSchool.code}</span></span>
                  </p>
                </div>
              </div>

              {/* View switch tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    activeTab === 'news'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yangiliklar ({news.length})
                </button>
                <button
                  onClick={() => setActiveTab('school_info')}
                  className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    activeTab === 'school_info'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Maktab ma'lumotlari
                </button>
              </div>
            </div>

            {/* Tab 1: News Feed */}
            {activeTab === 'news' && (
              <>
                {loadingNews ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-medium">Yangiliklar yuklanmoqda...</p>
                  </div>
                ) : (
                  <NewsFeed
                    school={currentSchool}
                    news={news}
                    isAdmin={isCurrentAdmin}
                    onOpenCreateNews={() => {
                      setEditingNewsItem(null);
                      setCreateNewsOpen(true);
                    }}
                    onEditNews={(item) => {
                      setEditingNewsItem(item);
                      setCreateNewsOpen(true);
                    }}
                    onDeleteNews={handleDeleteNews}
                    onOpenMediaViewer={(type, images, index, videoUrl, title) => {
                      setMediaViewer({
                        isOpen: true,
                        type,
                        images,
                        index,
                        videoUrl,
                        title,
                      });
                    }}
                  />
                )}
              </>
            )}

            {/* Tab 2: School Info */}
            {activeTab === 'school_info' && (
              <SchoolInfoView
                school={currentSchool}
                isAdmin={isCurrentAdmin}
                onOpenCreateNews={() => {
                  setEditingNewsItem(null);
                  setCreateNewsOpen(true);
                }}
                onOpenAdminPanel={() => setAdminPanelOpen(true)}
                onNavigateToNews={() => setActiveTab('news')}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 pt-2 flex items-center justify-around shadow-lg"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => setShowPortal(true)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer py-1 px-2 ${
            showPortal ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Bosh sahifa</span>
        </button>
        {currentSchool && (
          <button
            onClick={() => {
              setShowPortal(false);
              setActiveTab('news');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer py-1 px-2 ${
              !showPortal && activeTab === 'news' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Yangiliklar</span>
          </button>
        )}
        <button
          onClick={() => {
            setPrefillJoinCode('');
            setJoinSchoolOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 cursor-pointer py-1 px-2"
        >
          <LinkIcon className="w-5 h-5 text-indigo-600" />
          <span>Qo‘shilish</span>
        </button>
        <button
          onClick={() => setCreateSchoolOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 cursor-pointer py-1 px-2"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>Yaratish</span>
        </button>
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 cursor-pointer py-1 px-2"
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </button>
      </div>

      {/* Modals */}
      <CreateSchoolModal
        isOpen={createSchoolOpen}
        onClose={() => setCreateSchoolOpen(false)}
        onSchoolCreated={handleSchoolCreated}
      />

      <JoinSchoolModal
        isOpen={joinSchoolOpen}
        onClose={() => setJoinSchoolOpen(false)}
        userProfile={userProfile}
        onSchoolJoined={handleSchoolJoined}
        availableSchools={schools}
        initialCode={prefillJoinCode}
      />

      {currentSchool && (
        <CreateNewsModal
          isOpen={createNewsOpen}
          onClose={() => {
            setCreateNewsOpen(false);
            setEditingNewsItem(null);
          }}
          school={currentSchool}
          editingNews={editingNewsItem}
          onNewsSaved={handleNewsSaved}
        />
      )}

      {currentSchool && adminUser && (
        <AdminPanelModal
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          school={currentSchool}
          adminUser={adminUser}
          newsList={news}
          onOpenCreateNews={() => {
            setEditingNewsItem(null);
            setCreateNewsOpen(true);
          }}
          onEditNews={(item) => {
            setEditingNewsItem(item);
            setCreateNewsOpen(true);
          }}
          onDeleteNews={handleDeleteNews}
          onSchoolUpdated={(updated) => {
            setCurrentSchool(updated);
            setSchools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          }}
        />
      )}

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={(school, admin) => {
          setAdminUser(admin);
          handleSelectSchool(school);
        }}
      />

      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userProfile={userProfile}
        connectedSchools={connectedSchools}
        currentSchool={currentSchool}
        adminUser={adminUser}
        onProfileUpdated={setUserProfile}
        onSelectSchool={handleSelectSchool}
        onDisconnectSchool={handleDisconnectSchool}
        onAdminLogout={handleAdminLogout}
      />

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onSelectNotification={(n) => {
          const targetSchool = schools.find((s) => s.id === n.schoolId);
          if (targetSchool) {
            handleSelectSchool(targetSchool);
          }
        }}
        onClearNotifications={() => {
          setNotifications([]);
          setUnreadNotifs(0);
        }}
      />

      <MediaViewerModal
        isOpen={mediaViewer.isOpen}
        onClose={() => setMediaViewer((prev) => ({ ...prev, isOpen: false }))}
        mediaType={mediaViewer.type}
        images={mediaViewer.images}
        initialImageIndex={mediaViewer.index}
        videoUrl={mediaViewer.videoUrl}
        title={mediaViewer.title}
      />
    </div>
  );
}
