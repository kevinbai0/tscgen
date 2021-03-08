"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesData = void 0;
exports.routesData = {
    FindPetsRoute: { route: '/pets', method: 'get' },
    AddPetRoute: { route: '/pets', method: 'post' },
    FindByPetIdRoute: { route: '/pets/{id}', method: 'get' },
    DeletePetRoute: { route: '/pets/{id}', method: 'delete' },
};
