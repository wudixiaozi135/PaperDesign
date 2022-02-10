namespace core
{
    export class BitmapUI extends eui.Image
    {
        constructor(resName: string)
        {
            super();
            this.source = RES.getRes(resName);
        }
    }
}