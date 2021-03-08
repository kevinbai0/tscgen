"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const baseQuery = {
    toast: 'string',
    toast_type: 'string',
};
exports.routes = {
    Home: {
        route: '/',
        query: {
            ...baseQuery,
            card_id: 'string',
            transaction_id: 'string',
        },
        breadcrumb: {
            root: true,
        },
    },
    Users: {
        route: '/users',
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: true,
        },
    },
    WaitlistUsers: {
        route: '/waitlist-users',
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: true,
        },
    },
    User: {
        route: '/users/{user_id}',
        params: ['user_id'],
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: false,
            dynamic: true,
            params: [],
            dependsOn: ['Users'],
            template: `{user_id}`,
        },
    },
    Transactions: {
        route: '/transactions',
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: true,
        },
    },
    Transaction: {
        route: '/transactions/{transaction_id}',
        params: ['transaction_id'],
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: false,
            dynamic: true,
            params: [],
            dependsOn: ['Transactions'],
            template: '{transaction_id}',
        },
    },
    UserTransaction: {
        route: '/user-transactions/{user_transaction_id}',
        params: ['userTransactionId'],
        query: {
            ...baseQuery,
        },
        breadcrumb: {
            root: true,
        },
    },
    ApiLogin: {
        route: '/api/login',
        query: {
            ...baseQuery,
            ci: 'string',
            betaInviteCode: 'string',
            mpDistinctId: {
                type: 'string',
                required: true,
            },
        },
        params: [],
        breadcrumb: {
            root: true,
        },
    },
    ApiCallback: {
        route: '/api/callback',
        query: {
            ...baseQuery,
            mpDistinctId: {
                type: 'string',
                required: true,
            },
        },
        params: [],
        breadcrumb: {
            root: true,
        },
    },
    ApiLogout: {
        route: '/api/logout',
        query: {
            ...baseQuery,
        },
        params: [],
        breadcrumb: {
            root: true,
        },
    },
};
