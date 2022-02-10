class Global
{
    static score: number = 0;
    //关卡
    static stageId: number = 1;

    //这里配置关卡障碍
    static blockMap = {
        1: [],
        2: [0, 1, 8, 9, 6, 7, 14, 15],
        3: [0, 1, 8, 9, 6, 7, 14, 15, 96, 97, 102, 103, 104, 105, 110, 111],
    };
}