function() {
  (this.tags || []).forEach(function(t) { emit(t, 1); });
}
