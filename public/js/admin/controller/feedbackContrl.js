var utility = Utility.getInstance();

// List feedbacks controller
function FeedbackListCtrl($scope, Feedback, $compile, $rootScope) {
	
    // List all buildings
	$scope.loading = true;
	$scope.hasPagination = true;
	Feedback.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			feedbacks = obj.feedbacks;

		$scope.feedbacks = feedbacks;
		$scope.loading = false;
		$scope.count = count;
		
		// Trigger pagination		
		if( totalPages > 1 ) {

			$scope.hasPagination = false;
			$("#pagination").paginate({
				count: totalPages,
				start: 1,
				display: 5,
				border: false,
				text_color: '#79B5E3',
				background_color: 'none',	
				text_hover_color: '#2573AF',
				background_hover_color: 'none',
				mouse: 'press'
			});
			$compile( angular.element('#pagination').contents() )($scope);

		}

	});

	// Function for load specific page
	$scope.loadPage = function(e, page){

		var element = angular.element(e.currentTarget);
		Feedback.list({ page: page }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				feedbacks = obj.feedbacks;

			$scope.feedbacks = feedbacks;

		});

	};
	
}

// FeedbackListCtrl.$inject = ['$scope', 'Feedback'];

// Show feedbacks controller
function FeedbackShowCtrl($scope, Feedback, $compile, $rootScope) {
	
    // List all buildings
	$scope.loading = true;
	$scope.hasPagination = true;
	Feedback.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			feedbacks = obj.feedbacks;

		
		$scope.feedbacks = feedbacks;
		$scope.loading = false;

	});

}

// FeedbackShowCtrl.$inject = ['$scope', 'Feedback'];
