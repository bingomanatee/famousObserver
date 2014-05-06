console.log('ele.js found');

define(function (require, exports, module) {
    /**
     * these tests validate the basic ability of the serializer to
     * recognize the correct properties of DOM elements.
     *
     * the tests are run on four classes:
     *
     * elemOne and elemTwo are fully populated dom elements.
     * elemOne is not visible; elemTwo is.
     * elemOne has a single class; elemTwo has two classes.
     * both elemOne and elemTwo have humanized versions of their ID as content
     *
     * elemThreeEmpty is an "anonymous" div; other than its ID it has no content and no properties.
     * eleFourNotInDom is nonexitetnt - it is the result of asking for a DOM element whose ID is not in the document.
     *
     * Tese tests validate that sensible results are given even if a requested property is absent,
     * and if the subject of the serialization is not a dom element (or not anything).
     *
     */
    module.exports = function () {

        describe('eleSerialize', function () {
            var eleSerialize;
            var eleOne;
            var eleTwo;
            var eleThreeEmpty;
            var eleFourNotInDom;

            before(function () {
                eleSerialize = require('./../eleSerialize');
                eleOne = document.getElementById('ele1');
                eleTwo = document.getElementById('ele2');
                eleThreeEmpty = document.getElementById('ele3'); // an element with no real features
                eleFourNotInDom = document.getElementById('ele4'); // a nonexistent element
            });

            describe('content', function () {
                it('should get innerHTML from ele1 via content', function () {
                    var ser = eleSerialize(eleOne, ['content']);
                    expect(ser.content).to.eql('Element One')
                });

                it('should get innerHTML from ele2 via content', function () {
                    var ser = eleSerialize(eleTwo, ['content']);
                    expect(ser.content).to.eql('Element Two')
                });
                it('should get innerHTML from ele3empty via content as empty string', function () {
                    var ser = eleSerialize(eleThreeEmpty, ['content']);
                    expect(ser.content).to.eql('')
                });

                it('should get innerHTML from eleFourNotInDom as null', function () {
                    var ser = eleSerialize(eleFourNotInDom, ['content']);
                    expect(ser.content).to.eql(null);
                })
            });

            describe('classes', function () {
                it('should reflect that ele1 clases are ["foo"]', function () {
                    var ser = eleSerialize(eleOne, ['classes']);
                    expect(ser.classes).to.eql(['foo']);
                });

                it('should reflect that eleTwo clases are ["foo","bar"]', function () {
                    var ser = eleSerialize(eleTwo, ['classes']);
                    expect(ser.classes).to.eql(['foo', 'bar']);
                });

                it('should reflect that eleThreeEmpty clases are []', function () {
                    var ser = eleSerialize(eleThreeEmpty, ['classes']);
                    expect(ser.classes).to.eql([]);
                });

                it('should reflect that eleFourNotInDom clases are []', function () {
                    var ser = eleSerialize(eleFourNotInDom, ['classes']);
                    expect(ser.classes).to.eql([]);
                });

            });

            describe('style', function () {
                it('should reflect that ele1 style is "display: none"', function () {
                    var ser = eleSerialize(eleOne, ['style:display']);
                    expect(ser.style).to.eql({display: 'none'});
                });
                it('should reflect that ele2 style is "display: block"', function () {
                    var ser = eleSerialize(eleTwo, ['style']); // note -- will poll ALL style attrs - very inefficient
                    expect(ser.style.display).to.eql('block');
                    expect(JSON.stringify(ser.style).length > 100).to.be(true);
                });
                it('should reflect that ele2 (defualt) display is block"', function () {
                    var ser = eleSerialize(eleTwo, ['style']); // note -- will poll ALL style attrs - very inefficient
                    expect(ser.style.display).to.eql('block');
                });

                it('should reflect that ele2 position is abosolute', function () {
                    var ser = eleSerialize(eleTwo, ['style']); // note -- will poll ALL style attrs - very inefficient
                    expect(ser.style.position).to.eql('absolute');
                });

                it('should reflect that ele2.style without tags is really long', function () {
                    var ser = eleSerialize(eleTwo, ['style']); // note -- will poll ALL style attrs - very inefficient
                    expect(JSON.stringify(ser.style).length > 100).to.be(true);
                });

                it('should reflect that eleFourNotInDom style is empty', function () {
                        var ser = eleSerialize(eleFourNotInDom, ['style']); // note -- will poll ALL style attrs - very inefficient
                        expect(ser.style).to.eql({});
                    }
                )
            });

            describe('visibility', function () {
                it('should reflect that ele1 is not visible', function () {
                    var ser = eleSerialize(eleOne, ['visible']);
                    expect(ser.visible).to.eql(false);
                });

                it('should reflect that ele2 is visible', function () {
                    var ser = eleSerialize(eleTwo, ['visible']);
                    expect(ser.visible).to.eql(true);
                });

                it('should reflect that eleThreeEmpty is visible', function () {
                    var ser = eleSerialize(eleThreeEmpty, ['visible']);
                    expect(ser.visible).to.eql(true);
                });

                it('should reflect that eleFourNotInDom is not visible', function () {
                    var ser = eleSerialize(eleFourNotInDom, ['visible']);
                    expect(ser.visible).to.eql(false);
                })
            });

        });
    };
});