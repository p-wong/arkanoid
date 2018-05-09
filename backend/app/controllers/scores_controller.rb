class ScoresController < ApplicationController
  before_action :set_score, only: [:show,:update,:destroy]

  def index
    scores = Score.all
    render json: scores, status: 200
  end

  def create
    score = Score.create(score_params)
    render json: score, status: 201
  end

  def update
    @score.update(score_params)
    render json: @score, status: 200
  end

  def destroy
    scoreId = @score.id
    @score.destroy
    render json: {message:"Zap! Score deleted", scoreId:scoreId}
  end

  def show
    render json: @score, status: 200
  end

  private
  def score_params
    params.permit(:score, :user_id)
  end

  def set_score
    @score = Score.find(params[:id])
  end
end
