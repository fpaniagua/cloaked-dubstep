function ExampleFile() {
	ClassUtil.inherit(ExampleFile, this, Widget);
	this._super("ExampleFile");

	this.attach();
}
ClassUtil.processClass(ExampleFile, "ExampleFile");