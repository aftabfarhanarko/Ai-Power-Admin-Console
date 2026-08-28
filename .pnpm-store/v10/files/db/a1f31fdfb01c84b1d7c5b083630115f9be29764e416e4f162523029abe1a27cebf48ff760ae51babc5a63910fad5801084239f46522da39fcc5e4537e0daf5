import './styles/style.css';
import { PersonData, FormLabel } from './template';
interface Options {
    host?: string;
    apiKey: string;
    parentId: string;
    onSession: (err: any, response: any) => void;
}
interface MountOptions {
    formLabel?: FormLabel;
    submitBtnText?: string;
    loadingText?: string;
}
interface Params {
    callback?: string;
    person?: PersonData;
    vendorData?: string;
}
declare const Veriff: (options: Options) => {
    params: Params;
    setParams: (newParams: Params) => void;
    mount: (mountOptions?: MountOptions) => void;
};
export = Veriff;
