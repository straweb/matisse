angular.module('contentEditable', []).
    directive('contenteditable', function() {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
                if(!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || '');
                };

                // Listen for change events to enable binding
                element.bind('blur keydown change', function(e) {
                    if(e.keyCode == 13){
                        e.preventDefault();
                        scope.$parent.updateBoardName(scope.board);
                    }else{
                        scope.$apply(read);
                    }
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    if( attrs.stripBr && html == '<br>' ) {
                        html = '';
                    }
                    if(html != "")
                        ngModel.$setViewValue(html);
                }
            }
        };
    });
