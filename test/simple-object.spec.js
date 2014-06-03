describe('Simple object', function() {
	var john, mary;

	beforeEach(function() {
		john = new Foo('John');
		mary = new Foo('Mary');
	});

	it('shold say hi', function() {
		expect(john.sayHi()).toEqual('John says hi!');
		expect(mary.sayHi()).toEqual('Mary says hi!');
	});
});