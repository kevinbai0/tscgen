interface IHomePage {
  name: 'Home';
  route: '/';
  params: undefined;
  query: {
    toast?: string;
    toast_type?: string;
    card_id?: string;
    transaction_id?: string;
  };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IUsersPage {
  name: 'Users';
  route: '/users';
  params: undefined;
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IWaitlistUsersPage {
  name: 'WaitlistUsers';
  route: '/waitlist-users';
  params: undefined;
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IUserPage {
  name: 'User';
  route: '/users/{user_id}';
  params: ['user_id'];
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; dependsOn: ['Users']; template: '{user_id}' };
}

interface ITransactionsPage {
  name: 'Transactions';
  route: '/transactions';
  params: undefined;
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface ITransactionPage {
  name: 'Transaction';
  route: '/transactions/{transaction_id}';
  params: ['transaction_id'];
  query: { toast?: string; toast_type?: string };
  breadcrumbs: {
    params: [];
    dependsOn: ['Transactions'];
    template: '{transaction_id}';
  };
}

interface IUserTransactionPage {
  name: 'UserTransaction';
  route: '/user-transactions/{user_transaction_id}';
  params: ['userTransactionId'];
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IApiLoginPage {
  name: 'ApiLogin';
  route: '/api/login';
  params: [];
  query: {
    toast?: string;
    toast_type?: string;
    ci?: string;
    betaInviteCode?: string;
    mpDistinctId: string;
  };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IApiCallbackPage {
  name: 'ApiCallback';
  route: '/api/callback';
  params: [];
  query: { toast?: string; toast_type?: string; mpDistinctId: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

interface IApiLogoutPage {
  name: 'ApiLogout';
  route: '/api/logout';
  params: [];
  query: { toast?: string; toast_type?: string };
  breadcrumbs: { params: []; template: ''; dependsOn: [''] };
}

type Routes =
  | IHomePage
  | IUsersPage
  | IWaitlistUsersPage
  | IUserPage
  | ITransactionsPage
  | ITransactionPage
  | IUserTransactionPage
  | IApiLoginPage
  | IApiCallbackPage
  | IApiLogoutPage;

type Route = Routes[keyof Routes];
