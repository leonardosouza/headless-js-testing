describe('Simple object', function() {
	var john, mary;

	beforeEach(function() {
		john = new Foo('John');
		mary = new Foo('Mary');
	});

	it('should say hi', function() {
		expect(john.sayHi()).toEqual('John says hi!');
		expect(mary.sayHi()).toEqual('Mary says hi!');
	});


	it('should say hello', function() {
		expect(john.sayHello()).toEqual('John says hello!');
		expect(mary.sayHello()).toEqual('Mary says hello!');
	});
});