
const linking = {
  prefixes: ['florassence://app', 'https://florassence.app'],
  config: {
    screens: {
      Auth: 'auth',
      Listing: 'listing',
      Details: 'details/:itemId',
      MainTabs: {
        screens: {
          Tabs: {
            screens: {
              HomeStack: {
                screens: {
                  Home: '',
                  Focus: 'focus',
                  TaskDetail: 'task/:taskId',
                },
              },
              SearchStack: {
                screens: {
                  Search: 'tasks',
                  TaskDetail: 'task/:taskId',
                },
              },
              FavoritesStack: {
                screens: {
                  Favorites: 'favorites',
                  TaskDetail: 'task/:taskId',
                },
              },
              ProfileStack: {
                screens: {
                  Profile: 'profile',
                  EditProfile: 'profile/edit',
                },
              },
            },
          },
          DrawerStats:    'stats',
          DrawerSettings: 'settings',
          DrawerHelp:     'help',
          DrawerAbout:    'about',
        },
      },
    },
  },
};

export default linking;