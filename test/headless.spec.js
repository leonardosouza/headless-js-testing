describe('Simple object', function() {
	var cc;

	beforeEach(function() {
		cc = new Conta();
	});

	it('get number account', function() {
        cc.setNum(123);
		expect(cc.getNum()).toEqual(123);
	});
    
    it('get account balance', function() {
        expect(cc.getBalance()).toEqual(0);
    });
    
    it('set account balance', function() {
        cc.setBalance(1000);
        expect(cc.getBalance()).toEqual(1000);
    });
    
    it('set user account', function() {
       cc.setUserAccount("José Silva");
       expect(cc.name).toEqual("José Silva");
    });
});