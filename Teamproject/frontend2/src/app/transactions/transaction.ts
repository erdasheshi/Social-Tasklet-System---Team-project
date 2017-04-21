export class Transaction {
    constructor(
        public consumer: string,
        public provider: string,
        public computation: number,
        public coins: number,
        public status: string,
        public taskletid: string) { }
}