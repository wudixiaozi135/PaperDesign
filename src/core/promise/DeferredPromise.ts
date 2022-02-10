class DeferredPromise
{
    promise: Promise<any>;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
    then: any;
    catch: any;

    constructor()
    {
        let self = this;
        let promise = self.promise = new Promise((resolve, reject) =>
        {
            self.resolve = resolve;
            self.reject = reject;
        });
        self.then = promise.then.bind(promise);
        self.catch = promise.catch.bind(promise);
    }
}