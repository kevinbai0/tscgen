import { IJsBodyValue } from '../../javascript/types';
import { IType } from '../../typescript/types';
import { IEntityBuilder } from './entityBuilder';
interface IVarObjectBuilder extends IEntityBuilder<'object', string> {
    type: 'object';
    addBody(body: IJsBodyValue): IVarObjectBuilder;
    addTypeDef(typeDefinition: IType): IVarObjectBuilder;
    setLevel(level: 'const' | 'let' | 'var'): IVarObjectBuilder;
    markExport(): IVarObjectBuilder;
}
export declare const varObjectBuilder: (name: string, defaultValue?: {
    body: IJsBodyValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
}) => IVarObjectBuilder;
export {};
