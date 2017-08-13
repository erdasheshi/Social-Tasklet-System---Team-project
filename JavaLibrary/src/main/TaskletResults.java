package main;
import java.util.ArrayList;

public class TaskletResults {

	public ArrayList<ResultList> tResults;

	public TaskletResults() {
		tResults = new ArrayList<ResultList>();
	}

	public ResultList get(int handler) {
		for (ResultList results : tResults) {
			if (results.handler == handler) {
				return results; // TODO: Cast an ArrayList<Element>
								// into ArrayList<Result>?
			}
		}
		return null;
	}

	void addResults(ResultList result) {
		tResults.add(result);
	}

	public int size() {
		return tResults.size();
	}

}
