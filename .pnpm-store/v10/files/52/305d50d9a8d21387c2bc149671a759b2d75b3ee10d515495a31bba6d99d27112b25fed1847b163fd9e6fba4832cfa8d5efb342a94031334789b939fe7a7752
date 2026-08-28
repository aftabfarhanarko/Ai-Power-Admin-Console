export interface FormLabel {
    [P: string]: string;
}
export interface PersonData {
    givenName?: string;
    lastName?: string;
    idNumber?: string;
}
export interface InputCreationOptions {
    type: string;
    value?: string;
    name: string;
    label?: string;
    required: boolean;
}
export declare function createInput(opts: InputCreationOptions): HTMLInputElement;
export declare function createLabel(value: string, labelFor: any): HTMLLabelElement;
export interface CreationOptions {
    container: HTMLFormElement;
    name: string;
    label: string;
    shouldRender: boolean;
    required: boolean;
}
export declare function createInputIfNeeded(opts: CreationOptions): void;
export declare function createDescription(): HTMLParagraphElement;
export interface Options {
    formLabel?: FormLabel;
    person?: PersonData;
    vendorData?: string;
    submitBtnText?: string;
}
export declare function createTemplate(parentId: string, options: Options): HTMLFormElement;
