using System.ComponentModel.DataAnnotations;

namespace back.Common.Helpers;

public class EndpointHelpers
{
    public static IEnumerable<string> Validate(object model)
    {
        var context = new ValidationContext(model);
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(model, context, validationResults, true))
            return validationResults.Select(x => x.ErrorMessage);

        return [];
    }
}
