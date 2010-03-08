Tea.require(
    '../src/testing.js',
    
    '../tests/test_testing.js',
    '../tests/test_core.js',
    '../tests/test_template.js',
    // '../tests/test_resource.js',  REBUILDING
    '../tests/test_element.js',
    '../tests/test_container.js',
    //'../tests/test_list.js',       REBUILDING
    '../tests/test_panel.js',
    '../tests/test_widget.js',
    '../tests/test_form.js',
    '../tests/test_dialog.js',
    '../tests/test_stack.js',
    '../tests/test_model.js'
);

$(function()
{
    var results = Tea.Testing.run();
    
    if (results.count > results.passed)
    {
        // This color (#FF0000) offends me, and is my punishment for failing tests.
        // Just looked at it-- god it's awful.  Hopefully I won't skip writing tests to avoid it.
        $('.byline').append(" - <span style='color: #FF0000'>Fail</span>"); 
    }
    else
    {
        $('.byline').append(" - <span style='color: #88AA88'>Pass</span>");
    }
})