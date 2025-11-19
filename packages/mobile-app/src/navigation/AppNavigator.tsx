import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';

// Home Screens
import DashboardScreen from '../screens/home/DashboardScreen';
import FeedScreen from '../screens/home/FeedScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyCardScreen from '../screens/profile/MyCardScreen';

// Networking
import NetworkingScreen from '../screens/networking/NetworkingScreen';

// Feeds
import CollegeFeedsScreen from '../screens/feeds/CollegeFeedsScreen';
import CurrentAffairsScreen from '../screens/feeds/CurrentAffairsScreen';
import GeneralKnowledgeScreen from '../screens/feeds/GeneralKnowledgeScreen';
import DailyDigestScreen from '../screens/feeds/DailyDigestScreen';

// MCQ
import McqScreen from '../screens/mcq/McqScreen';

// Personality
import KnowYourselfScreen from '../screens/personality/KnowYourselfScreen';
import PersonalityResultScreen from '../screens/personality/PersonalityResultScreen';

// Jobs
import JobsScreen from '../screens/jobs/JobsScreen';
import GovtVacanciesScreen from '../screens/jobs/GovtVacanciesScreen';
import InternshipsScreen from '../screens/jobs/InternshipsScreen';
import FreelancingScreen from '../screens/jobs/FreelancingScreen';

// Events
import CollegeEventsScreen from '../screens/events/CollegeEventsScreen';

// Community
import StudentsCommunityScreen from '../screens/community/StudentsCommunityScreen';

// Mentors
import MentorsScreen from '../screens/mentors/MentorsScreen';
import GurujiScreen from '../screens/mentors/GurujiScreen';

// Institutes
import ExploreInstituteScreen from '../screens/institutes/ExploreInstituteScreen';

// Referral
import ReferralScreen from '../screens/referral/ReferralScreen';

// Performance
import PerformanceScreen from '../screens/performance/PerformanceScreen';

// Profile Wizard
import ProfileWizardScreen from '../screens/profile/ProfileWizardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabsNavigator}
        options={{ headerShown: false }}
      />
      {/* Profile Screens */}
      <Stack.Screen
        name="MyCard"
        component={MyCardScreen}
        options={{ title: 'My Card' }}
      />
      {/* Networking */}
      <Stack.Screen
        name="Networking"
        component={NetworkingScreen}
        options={{ title: 'Networking' }}
      />
      {/* Feeds */}
      <Stack.Screen
        name="CollegeFeeds"
        component={CollegeFeedsScreen}
        options={{ title: 'College Feeds' }}
      />
      <Stack.Screen
        name="CurrentAffairs"
        component={CurrentAffairsScreen}
        options={{ title: 'Current Affairs' }}
      />
      <Stack.Screen
        name="GeneralKnowledge"
        component={GeneralKnowledgeScreen}
        options={{ title: 'General Knowledge' }}
      />
      <Stack.Screen
        name="DailyDigest"
        component={DailyDigestScreen}
        options={{ title: 'Daily Digest' }}
      />
      {/* MCQ */}
      <Stack.Screen
        name="MCQ"
        component={McqScreen}
        options={{ title: 'MCQ Practice' }}
      />
      {/* Personality */}
      <Stack.Screen
        name="KnowYourself"
        component={KnowYourselfScreen}
        options={{ title: 'Know Yourself' }}
      />
      <Stack.Screen
        name="PersonalityResult"
        component={PersonalityResultScreen}
        options={{ title: 'Your Results' }}
      />
      {/* Jobs */}
      <Stack.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: 'Jobs' }}
      />
      <Stack.Screen
        name="GovtVacancies"
        component={GovtVacanciesScreen}
        options={{ title: 'Government Vacancies' }}
      />
      <Stack.Screen
        name="Internships"
        component={InternshipsScreen}
        options={{ title: 'Internships' }}
      />
      <Stack.Screen
        name="Freelancing"
        component={FreelancingScreen}
        options={{ title: 'Freelancing' }}
      />
      {/* Events */}
      <Stack.Screen
        name="CollegeEvents"
        component={CollegeEventsScreen}
        options={{ title: 'College Events' }}
      />
      {/* Community */}
      <Stack.Screen
        name="StudentsCommunity"
        component={StudentsCommunityScreen}
        options={{ title: 'Students Community' }}
      />
      {/* Mentors */}
      <Stack.Screen
        name="Mentors"
        component={MentorsScreen}
        options={{ title: 'Industry Mentors' }}
      />
      <Stack.Screen
        name="Guruji"
        component={GurujiScreen}
        options={{ title: 'Guruji' }}
      />
      {/* Institutes */}
      <Stack.Screen
        name="ExploreInstitute"
        component={ExploreInstituteScreen}
        options={{ title: 'Explore Institutes' }}
      />
      {/* Referral */}
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ title: 'Refer & Earn' }}
      />
      {/* Performance */}
      <Stack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: 'My Performance' }}
      />
      {/* Profile Wizard */}
      <Stack.Screen
        name="ProfileWizard"
        component={ProfileWizardScreen}
        options={{ title: 'Complete Your Profile' }}
      />
    </Stack.Navigator>
  );
}

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
