class User < ApplicationRecord
  has_many :scores

  def max_score
    self.scores.max_by { |score_object| score_object.score }
  end
end
