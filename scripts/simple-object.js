window.Foo = (function () {
    var Foo = function (name) {
        this.name = name;
    };

    Foo.prototype.sayHi = function () {
        return this.name + ' says hi!';
    };

    Foo.prototype.sayHello = function () {
        return this.name + ' says hello!';
    };

    return Foo;
}());