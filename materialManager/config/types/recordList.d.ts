import { RecordMaterialComputed } from "@types";

type RecordBelongField = 'system' | 'purchase' | 'repo' | 'repoExtra'
export type RecordBelongItem<T extends RecordBelongField> = {
    belong: T;
    shortLabel: string;
    label: string;
    onlyShowLastSpecInput: boolean;
}