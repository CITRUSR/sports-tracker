namespace back.Common.Types;

public class Result<T>
{
    public bool IsSuccess => Errors.Count == 0;
    public IReadOnlyCollection<string> Errors { get; private set; } = [];
    public string ErrorsString => string.Join(", ", Errors);
    public T Data { get; private set; }

    public static Result<T> Success(T data) => new() { Data = data };
    public static Result<T> Failure(List<string> errors) => new() { Errors = errors };
    public static Result<T> Failure(string error) => new() { Errors = [error] };
}

public class Result
{
    public bool IsSuccess => Errors.Count == 0;
    public IReadOnlyCollection<string> Errors { get; private set; } = [];
    public string ErrorsString => string.Join(", ", Errors);

    public static Result Success() => new() { };
    public static Result Failure(List<string> errors) => new() { Errors = errors };
    public static Result Failure(string error) => new() { Errors = [error] };
}