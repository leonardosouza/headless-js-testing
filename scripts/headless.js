window.Conta = (function () {
    var Conta = function (num) {
        this.num = num;
        this.saldo = 0;
    };

    Conta.prototype.setNum = function (num) {
        //console.log(num);
        this.num = num;
    };

    Conta.prototype.getNum = function () {
        return this.num;
    };
    
    Conta.prototype.getBalance = function() {
        return this.saldo;
    };
    
    Conta.prototype.setBalance = function(num) {
        this.saldo += num;
    };
    
    Conta.prototype.setUserAccount = function(name) {
        this.name = name;
    };
    
    return Conta;
}());