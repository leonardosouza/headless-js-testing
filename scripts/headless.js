(function () {
    var Conta = function (num) {
        this.num = num;
    };

    Conta.prototype.setNum = function (num) {
        console.log(num);
        this.num = num;
    };

    Conta.prototype.getNum = function () {
        return this.num;
    };
}());