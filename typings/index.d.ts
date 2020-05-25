/// <reference types="@fibjs/types" />
declare function LoadBalance(params: {
    urls: string[];
    health?: string;
    response?: string;
}): Class_HttpRepeater;
export = LoadBalance;
