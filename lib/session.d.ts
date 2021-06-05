declare module 'telegraf-session-azure-table-storage' {
    import { Context } from 'telegraf';

    interface StoreOptions {
        readonly accountName?: string;
        readonly accountKey?: string;
    }

    interface AzureTableStorageOptions {
        readonly property?: string;
        readonly store: StoreOptions;
        readonly getSessionKey?: (ctx: any) => any;
    }

    type ContextUpdate = (ctx: any, next?: (() => any) | undefined) => any;

    class AzureTableStorageSession {
        client: any;
        middleware(): ContextUpdate;
        getSession(key: Context): string;
        clearSession(key: string): void;
        constructor(options?: AzureTableStorageOptions);
        saveSession(key: string, session: object): object;
    }

    export default AzureTableStorageSession;
}
